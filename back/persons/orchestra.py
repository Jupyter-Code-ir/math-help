from aaaai.orchestra import Orchestration
from persons.models import Person
from persons.agent import WhitePerson


class PersonOrchestration(Orchestration):
    def __init__(self, modelName, maxRetray=3, baseUrl="http://localhost:11434"):
        super().__init__(modelName, maxRetray, baseUrl)

        # create all persons for orchestra
        all_persons = Person.objects.all()
        for person in all_persons:
            agent = WhitePerson(person.pk, modelName)
            self.agents[agent] = agent._descibe_yourself()

    def __str__(self):
        return (
            "Orchestra ["
            + ", ".join([str(agent) for agent in self.agents.keys()])
            + "]"
        )

    def whoResponse(self, message):
        """this function found who can response this data"""

        result = []
        for agent, desc in self.agents.items():
            # check can awnser the message
            if not agent.canYouAwnser(message):
                continue

            result.append(agent)

        return result

    def limitOrchestra(self, message):
        """
        this function remove addtional persons on orchestra
        and just stay persons who can awnser the message
        """

        # filter presons can response
        personsCanResponse = self.whoResponse(message)

        # change agents
        self.agents = {
            agent: desc
            for agent, desc in self.agents.items()
            if agent in personsCanResponse
        }

    def _addNewPerson(self, message):  # , desc: str | None, age: int | None = None
        """this function create new person if person not exists on agents

        Args:
            name (str): name of person
        """

        personData = self.parameter(
            message,
            {
                "name": "name of person",
                "age": "age of person if not exists return None",
            },
        )

        print(personData)
        # create person on database
        # person = Person.objects.create(
        #     name=name,
        #     # character="" if desc is None else desc,
        #     # age=age,
        # )

        # add agent to orchestration
        # print("agent create with descibe")
        # agent = WhitePerson(person.pk, self.modelName)
        # self.agents[agent] = agent._descibe_yourself()
