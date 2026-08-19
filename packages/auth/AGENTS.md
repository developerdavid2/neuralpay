# Auth

## Overview

The better-auth server config used by the user service: email OTP and two factor plugins, custom user fields, cookie cache, nodemailer for email.

## Stack

- **Key dependencies**: better-auth, drizzle-orm, zod, nodemailer

## Conventions

- Single `createAuth()` in `src/index.ts`; email templates in `src/lib/email-templates.ts`
- Sessions last 24 hours

## Gotchas

- Polar plugin dependencies are present but unused

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
