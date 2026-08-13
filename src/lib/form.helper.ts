import type { FormEvent } from "react";

// Every form in this app persists over fetch, so the browser's default submit —
// a full page navigation — is always wrong. This is the one line that says so,
// shared rather than repeated, because a form that forgets it reloads the app
// and loses what the reader just typed.
//
// It exists so the four forms can be real <form> elements: before this, the
// commit was a plain onClick on a `type="button"`, which meant Enter did
// nothing anywhere in the app.
export function onSubmitForm(submit: () => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };
}
