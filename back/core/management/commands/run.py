from core.models import RefCommand
from persons.orchestra import PersonOrchestration
from aaaai.agent import _descibe_yourself


class Command(RefCommand):
    def handle(self, *args, **options):
        orchestra = PersonOrchestration("gemma3:12b")

        orchestra.limitOrchestra("i want a limonade")
        # orchestra.tool_message("do you know who is Ali?")
        
        print(orchestra)