# Changes Compared to the Original

- Install
   + Installing ```playwright install chromium ``` now starts the server.
   + Custom Docker runs directly on source code: ```docker-compose-dev.yml```
- Agent
    + Modifications
        - Google Component
            - Added Google Search **Provider**. 
                + SerpApi: https://serpapi.com/
                + GoogleCustomSearch: https://developers.google.com/custom-search/v1/overview
                + OpenSearch: Seft code
            - Form allow search, instead of scroll to search.
        - Wikipedia Component
            - Form allow search, instead of scroll to search.
        - Rewrite Component
            - Form allow search, instead of scroll to search.
    + Fixed BUG
            + DynamicVariablesForm fixed import type interface
    + New Additions
      - Added Variables: Extracts information, used throughout the conversation process, or combined with Invoke to link to external services.
- Api
    - New Additions
        + OpenAI compatibility with Agent
- Docs
   + OpenAI Compatibility 
    - Modifications chat completion
    - Create agent completion
    - Variables component
- Install Lib
    - googlesearch-python==1.3.0: Using in Component Agent Google 's provider **OpenSearch**