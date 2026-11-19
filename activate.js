(() => {
  const project = "https://qsycldeqkdgteccdpsty.supabase.co";
  const key = "sb_publishable_NgGaWw94975TuAOF9V_LQw_THs95Vyc";
  const challenge = location.hash.slice(1);
  const status = document.getElementById("activateStatus");
  const emailForm = document.getElementById("activateEmailForm");
  const codeForm = document.getElementById("activateCodeForm");
  const emailInput = document.getElementById("activateEmail");
  const codeInput = document.getElementById("verifyCode");
  let email, session;
  if (!/^[0-9a-f]{64}$/.test(challenge)) return;
  emailForm.hidden = false;
  status.textContent = "Verify your beta email. Leave Acoustic open while this page connects to it.";

  async function post(path, body, token) {
    const response = await fetch(project + path, {
      method: "POST",
      headers: {
        apikey: key,
        "content-type": "application/json",
        ...(token ? { authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Error("Request failed");
    return response.json();
  }

  emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = emailForm.querySelector("button");
    button.disabled = true;
    email = emailInput.value.trim().toLowerCase();
    session = undefined;
    try {
      await post("/auth/v1/otp", { email, create_user: true });
      status.textContent = "Check your inbox for the verification code.";
      emailForm.hidden = true;
      codeForm.hidden = false;
      codeInput.focus();
    } catch {
      status.textContent = "We couldn’t send a code. Wait a minute and try again. If it still fails, contact Acoustic.";
    } finally {
      button.disabled = false;
    }
  });

  codeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const buttons = [...codeForm.querySelectorAll("button")];
    buttons.forEach((button) => button.disabled = true);
    try {
      if (!session) {
        const verified = await post("/auth/v1/verify", { email, token: codeInput.value, type: "email" });
        if (typeof verified.access_token !== "string") throw Error("No session");
        session = verified.access_token;
      }
      const outcome = await post("/rest/v1/rpc/authorize_windows_beta_pair", { pair_challenge: challenge }, session);
      session = undefined;
      codeForm.hidden = true;
      codeForm.reset();
      status.textContent = {
        approved: "Verification complete. Return to Acoustic. It will activate automatically.",
        signup_required: "This email is not on the Windows beta list. Sign up from the homepage first, then reopen activation from the app.",
        ended: "Your Acoustic beta access has ended.",
      }[outcome] || "This activation request is no longer available. Start again from Acoustic.";
    } catch {
      status.textContent = session
        ? "Your email is verified. Select Activate again to retry the pairing."
        : "That verification code couldn’t be confirmed. Check the code or request another.";
    } finally {
      buttons.forEach((button) => button.disabled = false);
    }
  });

  document.getElementById("activateAgain").addEventListener("click", () => {
    session = undefined;
    codeForm.reset();
    codeForm.hidden = true;
    emailForm.hidden = false;
    emailInput.focus();
    status.textContent = "Enter your beta email to request a verification code.";
  });
})();
