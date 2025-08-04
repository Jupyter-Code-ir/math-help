from aaaai.white import WhiteAgent
from persons.models import Person


characterPrompt = """
You live in a story.
Humanize all your actions.
All you know is limited to the character described to you.
Put yourself in the character's shoes and imitate him exactly.
All you have to offer are the character's words.
You should not explain anything more than the character's words.
Your words should be clear and unambiguous.
You can only comment on information that happened in **EVENTS**.
If I asked you about something that happened to you in **EVENTS**, you would explain it in full. 
If I asked you about something that not happened to you in **EVENTS**, you would say **I have no information about it**.
"""


class WhitePerson(WhiteAgent):
    def __init__(self, name, modelName, maxRetray=3, baseUrl="http://localhost:11434"):
        # person find
        try:
            self.person: Person = Person.objects.get(name=name)
        except Person.DoesNotExist:
            self.person: Person = Person.objects.get(pk=name)

        # set agent data
        self.name = self.person.name

        # add person data to prompt
        personData = {
            "Name": self.person.name,
            "Character": self.person.character,
        }

        if self.person.gender is not None:
            personData["Gender"] = self.person.gender

        if self.person.age is not None:
            personData["Age"] = self.person.age

        personData = "\n\n".join([f"{k}:\n{v}" for k, v in personData.items()])

        # set super data for class
        super().__init__(
            mainText=f"{characterPrompt}\n\n{personData}",
            modelName=modelName,
            maxRetray=maxRetray,
            baseUrl=baseUrl,
        )

    def _descibe_yourself(self):
        return self.person.character

    def __str__(self):
        return f"agent {self.name}"

    @property
    def prompt(self):
        events = self.person.events
        self.system_prompt["EVENTS"] = [event.prompt for event in events]
        return super().prompt

    @property
    def _ignoreFuncs(self):
        return ["canYouAwnser", "checkMessage", *super()._ignoreFuncs]

    def canYouAwnser(self, quest):
        select = self.select(
            f"can you awnser this question? just set YES or NO\n```{quest}```",
            ["YES", "NO"],
        )

        # if not awnser
        if select is None:
            return select

        # make it True or False
        return select == "YES"

    def checkMessage(self, message):
        """
        on this function person first think that can awnser to response,
        if person can response it, message it.

        price: 2 Message
        """

        # check about message
        if not self.canYouAwnser(message):
            return "i have no information about it"

        # response
        return self.message(message)
