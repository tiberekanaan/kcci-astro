import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { CONTACT_EMAIL, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from 'astro:env/server';
import nodemailer from 'nodemailer';

export const server = {
	contact: defineAction({
		accept: 'form',
		input: z.object({
			name: z.string().min(2, 'Please enter your name.').max(100, 'Name is too long.'),
			email: z.email('Please enter a valid email address.'),
			subject: z
				.string()
				.min(3, 'Please enter a subject.')
				.max(150, 'Subject is too long.'),
			message: z
				.string()
				.min(10, 'Please write a message of at least 10 characters.')
				.max(5000, 'Message is too long.'),
			// Honeypot: hidden field real users leave empty.
			website: z.string().optional(),
		}),
		handler: async ({ name, email, subject, message, website }) => {
			// Bots that fill the honeypot get a silent "success".
			if (website) return { ok: true };

			const mail = {
				from: { name: 'KCCI Website', address: SMTP_USER ?? CONTACT_EMAIL },
				to: CONTACT_EMAIL,
				replyTo: { name, address: email },
				subject: `[KCCI Website] ${subject}`,
				text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
			};

			if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
				// No SMTP configured: usable in dev, an explicit error in production.
				if (import.meta.env.DEV) {
					console.info('[contact] SMTP not configured; email that would be sent:', mail);
					return { ok: true };
				}
				throw new ActionError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `The contact form is not available right now. Please email us directly at ${CONTACT_EMAIL}.`,
				});
			}

			const transporter = nodemailer.createTransport({
				host: SMTP_HOST,
				port: SMTP_PORT,
				secure: SMTP_PORT === 465,
				auth: { user: SMTP_USER, pass: SMTP_PASS },
			});

			try {
				await transporter.sendMail(mail);
			} catch (error) {
				console.error('[contact] Failed to send email:', error);
				throw new ActionError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Sorry, your message could not be sent. Please try again later or email us directly at ${CONTACT_EMAIL}.`,
				});
			}

			return { ok: true };
		},
	}),
};
