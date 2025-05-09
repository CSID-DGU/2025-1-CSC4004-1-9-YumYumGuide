import os
import sys

print(sys.path)


from dotenv import load_dotenv
load_dotenv()

AMEBA_ID = os.environ.get("AMEBA_ID")
AMEBA_PW = os.environ.get("AMEBA_PW")

print(AMEBA_ID, AMEBA_PW)