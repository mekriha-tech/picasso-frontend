# Frontend <-> backend collaboration

The canonical protocol lives in the backend repo so there is one copy to keep current:
https://github.com/mekriha-tech/picasso-backend/blob/main/docs/COLLABORATION.md

The short version for this repo:

- **The API contract is `docs/openapi.json` in the backend repo** (plus `API_REFERENCE.md` for
  quirks). Build against it, not against guesses.
- **Need something from the API?** File an *API request* issue in the backend repo
  (label `needs-backend`) with the screen, the fields and an example response. Do not work
  around a missing endpoint with permanent mocks.
- **Backend finished something for you?** It arrives here as a `needs-frontend` issue with the
  endpoint, caveats and a definition of done.
- **Product or design question?** File a `needs-decision` issue here with options and a
  recommendation. Closed `needs-decision` issues are the decision log.
- **Never edit the other repo's code.** File an issue.
- Chat between sessions is only a nudge ("see issue #12"); requirements live in issues.
