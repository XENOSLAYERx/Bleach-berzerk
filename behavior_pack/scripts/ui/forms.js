// =====================================================================
//  Bleach: Berzerk  —  UI form helpers
//  Wraps @minecraft/server-ui with a retry so forms that fail with
//  "UserBusy" (common right after joining on mobile) re-show cleanly.
// =====================================================================
import { system } from "@minecraft/server";

/** Await N ticks. */
export function wait(ticks) {
  return new Promise((resolve) => system.runTimeout(resolve, ticks));
}

/**
 * Show a form, retrying while the client reports UserBusy (e.g. chat
 * open, still loading). Returns the final response or null if abandoned.
 */
export async function showForm(player, form, retries = 12) {
  for (let i = 0; i < retries; i++) {
    let res;
    try {
      res = await form.show(player);
    } catch (e) {
      return null;
    }
    if (res && res.canceled && res.cancelationReason === "UserBusy") {
      await wait(10);
      continue;
    }
    return res;
  }
  return null;
}
