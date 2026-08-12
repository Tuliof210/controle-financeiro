import { expect } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useEntryScreen } from "@/components/EntryScreen/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";
import { config, entries, people } from "./entry-screen-config.ts";

// The mocked doubles and the seeding, shared by the three EntryScreen hook
// suites. The jest.mock calls themselves stay in each test file: only there
// are they hoisted above the import of the hook under test.
const get = jest.mocked(apiGet);
const post = jest.mocked(apiPost);
const put = jest.mocked(apiPut);
const remove = jest.mocked(apiDelete);

const route = (path: string) => {
  if (path.startsWith("/api/people")) {
    return Promise.resolve({ data: people }) as never;
  }
  if (path.startsWith("/api/period")) {
    return Promise.resolve({ data: { start: 1, end: 2 } }) as never;
  }
  return Promise.resolve({ data: entries }) as never;
};

function seed(): void {
  jest.mocked(useProfile).mockReturnValue({ profile: FAMILY_PROFILE } as never);
  get.mockImplementation(route);
  post.mockResolvedValue({ data: null });
  put.mockResolvedValue({ data: null });
  remove.mockResolvedValue({ data: null });
}

async function mount() {
  const rendered = renderHook(() => useEntryScreen(config));
  await waitFor(() => expect(rendered.result.current.people).toEqual(people));
  return rendered;
}

const values = { type: "income" as const };

export { get, mount, post, put, remove, route, seed, values };
