# Server Actions reference

HomeEase has no REST API. Writes go through Server Actions, which are typed functions
callable from client components. Each one authenticates, authorises, validates with Zod,
calls a service, and revalidates the affected routes.

Every action returns `ActionState`:

```ts
{ ok?: boolean; error?: string; message?: string; fieldErrors?: Record<string,string>; data?: object }
```

## Auth — `actions/auth.actions.ts`

| Action | Notes |
|---|---|
| `loginAction` | Rate limited; generic error message so it can't be used to enumerate emails |
| `logoutAction` | Revokes the session row and clears the cookie |
| `registerCustomerAction` / `registerProviderAction` | Providers start as `PENDING` verification |
| `forgotPasswordAction` | Always reports success; in dev the reset link is returned |
| `resetPasswordAction` | Single-use token, revokes all sessions |
| `changePasswordAction`, `updateProfileAction` | Re-geocodes the area on address change |

## Customer — `actions/customer.actions.ts`

`uploadImageAction`, `createRequestAction` (optional `autoAssign`), `rematchAction`,
`selectProviderAction`, `cancelRequestAction`, `cancelBookingAction`, `reviewAction`,
`toggleFavoriteAction`, `markNotificationAction`, `markAllNotificationsAction`.

Ownership is checked on every one — a request id from the browser is never trusted.

## Provider — `actions/provider.actions.ts`

`updateJobStatusAction` (state machine + actor check; a declined job is immediately
re-matched to the next best provider), `providerRescheduleAction`, `saveAvailabilityAction`,
`addTimeOffAction`, `removeTimeOffAction`, `saveProviderServiceAction`,
`removeProviderServiceAction`.

## Admin — `actions/admin.actions.ts`

`approveProviderAction`, `setUserStatusAction`, `changeRoleAction` (granting admin needs an
explicit confirmation checkbox), `createUserAction`, `saveCategoryAction`,
`saveServiceAction`, `toggleServiceAction`, `saveMatchingConfigAction` (weights must total
100), `resetMatchingConfigAction`, `adminBookingAction` (cancel / reschedule / reassign /
mark paid).

The last active admin can never be suspended, deactivated or demoted — `assertNotLastAdmin`
guards it.

## Read paths

Server Components call services directly (`services/*.service.ts`). Those files are marked
`server-only`, so importing one into a client component is a build error rather than a
runtime data leak.
