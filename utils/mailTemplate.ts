export const mailTemplate = (
  name: string,
  email: string,
  organization: string,
  service: string,
  message: string,
) => `
<div style="font-family: Arial, sans-serif; color: #333;">
<h1>You've got a new message!</h1>
<p><strong>Someone named:</strong> <em>${name}</em> just reached out from your website</p>
<p><strong>Email address:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>They're representing:</strong> ${organization}</p>
<p><strong>Interested in:</strong> ${service}</p>
<hr />
<p><strong>Here's what they said:</strong></p>
<p style="white-space: pre-line; font-style: italic;">"${message}"</p>
<br/>
<p>Don't keep them waiting — maybe drop a quick reply!</p>
</div>
`;
