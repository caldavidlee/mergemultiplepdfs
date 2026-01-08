# Deployment Guide: Cloudflare + Vercel

This guide walks you through deploying the PDF Merger with enterprise-grade security using Cloudflare and Vercel.

## Architecture Overview

```
User Request → Cloudflare (CDN/WAF/DDoS) → Vercel (Hosting)
```

Cloudflare handles security, caching, and DDoS protection. Vercel serves your static files.

---

## Prerequisites

Before deploying, complete these security steps:

- [ ] Enable 2FA on your GitHub account
- [ ] Enable 2FA on your Vercel account
- [ ] Enable 2FA on your Cloudflare account
- [ ] Replace all `mergemultiplepdfs.com` placeholders with your actual domain

### Files to Update

Search and replace `mergemultiplepdfs.com` in:
- `index.html` (canonical URL, Open Graph tags, JSON-LD)
- `public/robots.txt` (sitemap URL)
- `public/sitemap.xml` (loc URL)
- `public/.well-known/security.txt` (canonical URL, contact email)

---

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: PDF Merger with security hardening"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. Vercel auto-detects Vite - keep default settings
5. Click **"Deploy"**
6. Note your Vercel URL (e.g., `your-project.vercel.app`)

### Vercel Settings to Verify

- **Framework Preset**: Vite
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)

---

## Step 3: Add Domain to Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Add a Site"**
3. Enter your domain name
4. Select **Free** plan (sufficient for this setup)
5. Cloudflare will scan existing DNS records
6. You'll receive two nameservers (e.g., `ada.ns.cloudflare.com`)

### Update Your Domain Registrar

Go to your domain registrar (GoDaddy, Namecheap, etc.) and change nameservers to the ones Cloudflare provided.

**Note**: DNS propagation can take up to 48 hours, but usually completes in 1-2 hours.

---

## Step 4: Configure DNS in Cloudflare

Add these DNS records:

| Type | Name | Target | Proxy Status |
|------|------|--------|--------------|
| CNAME | `@` | `cname.vercel-dns.com` | Proxied (orange cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | Proxied (orange cloud) |

**Important**: Keep proxy status ON (orange cloud) to enable Cloudflare protection.

---

## Step 5: Add Domain in Vercel

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Add `www.yourdomain.com` as well
4. Vercel will verify the domain (may take a few minutes)

---

## Step 6: Configure Cloudflare Security Settings

### SSL/TLS Settings

Go to **SSL/TLS** in Cloudflare dashboard:

| Setting | Value |
|---------|-------|
| SSL/TLS encryption mode | **Full (strict)** |
| Always Use HTTPS | **On** |
| Minimum TLS Version | **TLS 1.2** |
| Automatic HTTPS Rewrites | **On** |

### HSTS Configuration

Go to **SSL/TLS** → **Edge Certificates**:

1. Find **HTTP Strict Transport Security (HSTS)**
2. Click **Enable HSTS**
3. Configure:
   - Max Age: **12 months** (31536000 seconds)
   - Include subdomains: **On**
   - Preload: **On** (only after testing!)
   - No-Sniff: **On**

### Security Settings

Go to **Security** → **Settings**:

| Setting | Value |
|---------|-------|
| Security Level | **Medium** or **High** |
| Browser Integrity Check | **On** |
| Challenge Passage | **30 minutes** |

### Bot Fight Mode

Go to **Security** → **Bots**:

- Enable **Bot Fight Mode** (free tier)

---

## Step 7: Speed Optimization (Cloudflare)

Go to **Speed** → **Optimization**:

| Setting | Value |
|---------|-------|
| Auto Minify | **Off** (Vite already does this) |
| Brotli | **On** |
| Early Hints | **On** |
| Rocket Loader | **Off** (can break React apps) |

---

## Step 8: Caching Rules (Optional)

Go to **Caching** → **Configuration**:

| Setting | Value |
|---------|-------|
| Caching Level | **Standard** |
| Browser Cache TTL | **4 hours** |

### Page Rules (Optional - 3 free)

Create a page rule for `yourdomain.com/*`:
- **Cache Level**: Cache Everything
- **Edge Cache TTL**: 1 month

---

## Step 9: Test Your Deployment

### 1. Test the Application

Visit your domain and:
- [ ] Upload PDFs
- [ ] Reorder documents
- [ ] Select/deselect pages
- [ ] Merge and download
- [ ] Verify the merged PDF works

### 2. Verify Security Headers

Open browser DevTools → Network tab → Reload → Click on main document → Headers tab

Verify these headers are present:
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy`

### 3. Test SSL

Visit [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/) and enter your domain. You should get an **A+** rating.

### 4. Test Security Headers

Visit [securityheaders.com](https://securityheaders.com/) and enter your domain. Aim for an **A** rating.

---

## Troubleshooting

### "Too Many Redirects" Error

- Ensure Cloudflare SSL mode is **Full (strict)**, not **Flexible**
- Check that Vercel domain is properly configured

### CORS Errors

- This shouldn't happen since everything is client-side
- If it does, verify CSP headers in `vercel.json`

### Fonts Not Loading

- The font files are self-hosted via `@fontsource/dm-sans`
- Check browser DevTools console for CSP violations

### Preview Deployments Bypass Cloudflare

Vercel preview URLs (`your-project-git-abc123.vercel.app`) don't go through Cloudflare.

To restrict access:
1. Vercel → Project Settings → General
2. **Preview Deployment Privacy** → **Only Allow Project Members**

---

## Security Checklist

Final verification before going live:

- [ ] 2FA enabled on GitHub
- [ ] 2FA enabled on Vercel
- [ ] 2FA enabled on Cloudflare
- [ ] SSL/TLS mode set to Full (strict)
- [ ] HSTS enabled in Cloudflare
- [ ] Bot Fight Mode enabled
- [ ] Security headers verified in browser
- [ ] SSL Labs test shows A+ rating
- [ ] securityheaders.com shows A rating
- [ ] All placeholder URLs replaced with actual domain
- [ ] security.txt contact email updated

---

## Maintenance

### Regular Tasks

- **Weekly**: Review Dependabot PRs for security updates
- **Monthly**: Run `npm audit` locally
- **Quarterly**: Review Cloudflare analytics for suspicious traffic
- **Annually**: Update `security.txt` expiration date

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities automatically (when possible)
npm audit fix
```

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free |
| Cloudflare (Free) | Free |
| GitHub (Free) | Free |
| **Total** | **$0/month** |

For higher traffic or team features, Vercel Pro is $20/month and Cloudflare Pro is $20/month.

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Cloudflare analytics for blocked requests
3. Review browser DevTools console for errors

