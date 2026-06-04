import { formatCurrency } from "@/lib/utils";

const shell = (title: string, body: string) => `
  <div style="margin:0;padding:0;background:#020617;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:radial-gradient(circle at top,#0f766e33,transparent 40%),#020617;">
      <tr><td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:rgba(15,23,42,.86);overflow:hidden;">
          <tr><td style="padding:28px;border-bottom:1px solid rgba(255,255,255,.1);">
            <div style="font-size:13px;letter-spacing:.28em;text-transform:uppercase;color:#5eead4;">NovaVest Capital</div>
            <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:white;">${title}</h1>
          </td></tr>
          <tr><td style="padding:28px;font-size:15px;line-height:1.75;color:#cbd5e1;">${body}</td></tr>
          <tr><td style="padding:22px 28px;border-top:1px solid rgba(255,255,255,.1);font-size:12px;color:#64748b;">This is an automated message from NovaVest Capital. Keep your account credentials secure.</td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;

export const emailButton = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" style="margin:26px 0;">
    <tr>
      <td style="border-radius:999px;background:linear-gradient(135deg,#14b8a6,#2563eb);">
        <a href="${href}" style="display:inline-block;padding:14px 24px;color:white;text-decoration:none;font-weight:800;border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;

export const emails = {
  welcome: (name: string) => shell("Welcome to NovaVest Capital", `<p>Hello ${name},</p><p>Your NovaVest Capital account has been created successfully. You can now login, fund your wallet, select an investment plan, and track your portfolio from the dashboard.</p>`),
  adminNewRegistration: (name: string, email: string) => shell("New investor registration", `<p>A new user registered on NovaVest Capital.</p><p><b>Name:</b> ${name}<br/><b>Email:</b> ${email}</p>`),
  depositSubmitted: (name: string, amount: number, network: string) => shell("Deposit request received", `<p>Hello ${name},</p><p>Your deposit request of <b>${formatCurrency(amount)}</b> via <b>${network}</b> has been received and is pending admin review.</p>`),
  adminDeposit: (email: string, amount: number, network: string) => shell("New deposit request", `<p>A new deposit request needs approval.</p><p><b>User:</b> ${email}<br/><b>Amount:</b> ${formatCurrency(amount)}<br/><b>Network:</b> ${network}</p>`),
  depositStatus: (name: string, amount: number, status: string) => shell(`Deposit ${status.toLowerCase()}`, `<p>Hello ${name},</p><p>Your deposit of <b>${formatCurrency(amount)}</b> has been <b>${status}</b>.</p>`),
  withdrawalSubmitted: (name: string, amount: number) => shell("Withdrawal request received", `<p>Hello ${name},</p><p>Your withdrawal request of <b>${formatCurrency(amount)}</b> has been submitted and is pending admin review.</p>`),
  adminWithdrawal: (email: string, amount: number, wallet: string) => shell("New withdrawal request", `<p>A withdrawal request needs approval.</p><p><b>User:</b> ${email}<br/><b>Amount:</b> ${formatCurrency(amount)}<br/><b>Wallet:</b> ${wallet}</p>`),
  withdrawalStatus: (name: string, amount: number, status: string) => shell(`Withdrawal ${status.toLowerCase()}`, `<p>Hello ${name},</p><p>Your withdrawal request of <b>${formatCurrency(amount)}</b> has been <b>${status}</b>.</p>`),
  investmentCreated: (name: string, plan: string, amount: number, profit: number) => shell("Investment created", `<p>Hello ${name},</p><p>Your <b>${plan}</b> investment has been created.</p><p><b>Amount:</b> ${formatCurrency(amount)}<br/><b>Expected profit:</b> ${formatCurrency(profit)}</p>`),
  investmentCompleted: (name: string, plan: string, returnAmount: number) => shell("Investment completed", `<p>Hello ${name},</p><p>Your <b>${plan}</b> investment has completed and <b>${formatCurrency(returnAmount)}</b> has been credited to your account balance.</p>`),
  securityAlert: (name: string, message: string) => shell("Security alert", `<p>Hello ${name},</p><p>${message}</p>`)
};