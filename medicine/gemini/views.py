from django.shortcuts import render

# Create your views here.

from django.shortcuts import render
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import os

prompt = ChatPromptTemplate.from_messages([
    ("system", "너는 어떤 언어로 물어보더라도 한국어로 대답해야 해"),
    ("user", "{input")
])

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=os.environ["GEMINI_API_KEY"],
    temperature=0.7
)

#Langchain의 기본적인 문자열 출력 파서.
output_parser = StrOutputParser()

# Langchain 체인 구성 prompt | llm | output_parser
chain = prompt | llm.with_config({"run_name": "model"}) | output_parser.with_config({"run_name": "Assistant"})


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = {}
        if type (text_data) == json:
            text_data_json = json.loads(text_data)
        else:
            text_data_json["message"] = text_data
        message = text_data_json["message"]

        try:

            async for chunk in chain.astream_events({'input': message}, version="v1", include_names=["Assistant"]):
                if chunk["event"] in ["on_parser_start", "on_parser_stream"]:
                    await self.send(text_data=json.dumps(chunk))

        except Exception as e:
            print(e)
