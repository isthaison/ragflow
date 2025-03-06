# Changes Compared to the Original

- Install
   + Installing ```playwright install chromium ``` now starts the server.
   + Custom Docker runs directly on source code: ```docker-compose-dev.yml```
- Agent
   + Modifications
      - Added Google Search **Provider**. 
         SerpApi: https://serpapi.com/
         GoogleCustomSearch: https://developers.google.com/custom-search/v1/overview
         OpenSearch: Seft code
   + New Additions
      - Added Variables: Extracts information, used throughout the conversation process, or combined with Invoke to link to external services.
- Api
   + OpenAI compatibility with Agent
-Docs
   + OpenAI Compatibility 
    - Modifications chat completion
    - Create agent completion
