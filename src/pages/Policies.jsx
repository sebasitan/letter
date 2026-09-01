import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { BUSINESS, isMissing } from '../lib/business'
import { waLink, WHATSAPP_DISPLAY } from '../lib/contact'

// ============================================================
// Policy pages — Privacy, Terms, Shipping, Refunds.
//
// The content here describes what the site ACTUALLY does (see the
// data-flow notes in the privacy page: Supabase, Google Input Tools,
// India Post, the Web Speech API). If you change how the order form
// works, update these pages too.
//
// Business-specific details live in src/lib/business.js.
// ============================================================

// Shown only if a detail we actually depend on is blank. A missing
// premises address or GST is NOT an error — see business.js.
function Missing({ what }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold align-middle"
      style={{ backgroundColor: '#FBE9E4', color: '#B03030' }}>
      ⚠ add your {what} in src/lib/business.js
    </span>
  )
}

function Shell({ title, description, path, updated = true, children }) {
  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      <Seo title={title} description={description} path={path} />

      <section style={{ backgroundColor: '#451A1C' }} className="py-14 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/" className="text-xs" style={{ color: 'rgba(251,246,240,0.6)' }}>← Back to Ever Yours</Link>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mt-3" style={{ color: '#FBF6F0' }}>{title}</h1>
          {updated && (
            <p className="text-sm mt-2" style={{ color: 'rgba(251,246,240,0.6)' }}>
              Last updated {BUSINESS.policiesUpdated}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6 policy-body" style={{ color: '#5C3A2E' }}>
          {children}

          <div className="mt-12 pt-8 rounded-2xl p-6" style={{ borderTop: '1px solid #F0E6DC', backgroundColor: 'white' }}>
            <h2 className="font-playfair text-lg font-bold mb-2" style={{ color: '#3D1A1A' }}>Questions about this policy?</h2>
            <p className="text-sm mb-4">
              Message us on WhatsApp at <strong>{WHATSAPP_DISPLAY}</strong> or email{' '}
              <a href={`mailto:${BUSINESS.email}`} style={{ color: '#9D4433' }}>{BUSINESS.email}</a>.
            </p>
            <a href={waLink()} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full"
              style={{ backgroundColor: '#25D366', color: 'white' }}>
              💬 Chat on WhatsApp
            </a>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap text-sm">
            {[['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/shipping', 'Shipping'], ['/refunds', 'Refunds & Cancellation']]
              .filter(([p]) => p !== path)
              .map(([p, l]) => (
                <Link key={p} to={p} className="underline" style={{ color: '#9D4433' }}>{l}</Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const H = ({ children }) => (
  <h2 className="font-playfair text-xl font-bold mt-8 mb-3" style={{ color: '#3D1A1A' }}>{children}</h2>
)
const P = ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>
const UL = ({ children }) => <ul className="mb-4 space-y-2 list-disc pl-5 leading-relaxed">{children}</ul>

function Identity() {
  return (
    <>
      <P>
        This policy applies to <strong>{BUSINESS.legalName}</strong>, serving{' '}
        {isMissing(BUSINESS.serviceArea)
          ? <Missing what="service area" />
          : BUSINESS.serviceArea}
        {!isMissing(BUSINESS.address) && <>, operating from {BUSINESS.address}</>}
        {!isMissing(BUSINESS.gst) && <> (GST {BUSINESS.gst})</>}.
      </P>
      {isMissing(BUSINESS.address) && (
        <P>
          We're a small studio working from home, so there's no shopfront to visit —
          everything happens over WhatsApp and by post or courier. You'll always reach
          a real person on <strong>{WHATSAPP_DISPLAY}</strong>.
        </P>
      )}
    </>
  )
}

// ── Privacy ─────────────────────────────────────────────────
export function Privacy() {
  return (
    <Shell
      title="Privacy Policy"
      description="What Ever Yours collects when you order a handwritten letter, why we keep it, who we share it with, and how to have it deleted."
      path="/privacy"
    >
      <Identity />
      <P>
        You are trusting us with something personal — often the most personal thing you'll
        write all year. This page says plainly what happens to it. No lawyer-speak.
      </P>

      <H>What we collect</H>
      <UL>
        <li><strong>Your details:</strong> name, WhatsApp number, and email if you give one.</li>
        <li><strong>The letter itself:</strong> the message you write, who it's for, the occasion, your relationship to them, and the tone you asked for.</li>
        <li><strong>Delivery details:</strong> address, area, city, pincode, and the recipient's contact number.</li>
        <li><strong>Unfinished orders:</strong> if you fill in the first step and don't complete the order, we keep your name and number so we can follow up once. You can tell us to delete it and we will.</li>
      </UL>

      <H>Yes — we do store your message</H>
      <P>
        We have to. The writer working on your letter reads what you wrote in order to write it.
        It is stored in our secured database and only our team can access it.
      </P>
      <P>What we never do with it: share it, sell it, publish it, quote it in marketing,
        show it to the recipient as "what you submitted", or reuse it for anyone else's letter.</P>

      <H>Services that see your data</H>
      <P>Running the site means a few third parties touch some of it. Here is the honest list:</P>
      <UL>
        <li><strong>Supabase</strong> — our database and admin login. Your order and letter are stored here.</li>
        <li><strong>Vercel</strong> — hosts the website itself.</li>
        <li><strong>Google Input Tools</strong> — if you type phonetically in Tamil, Hindi, Kannada or Telugu, the word you are typing is sent to Google to be converted into that script. If you would rather Google saw none of it, type directly in your own script or write in English.</li>
        <li><strong>Your browser's speech service</strong> — if you use the 🎤 voice button, your browser handles the speech-to-text. On Chrome this means audio goes to Google. Typing instead avoids it entirely.</li>
        <li><strong>India Post</strong> — we send only your 6-digit pincode to look up the city and state. Nothing else.</li>
        <li><strong>WhatsApp (Meta)</strong> — how we send your draft and updates.</li>
        <li><strong>Delivery partners</strong> — Dunzo, Porter or India Post get the delivery name, address and phone number. They never receive the letter's contents.</li>
      </UL>

      <H>How long we keep it</H>
      <P>
        We keep order records for as long as we need them for accounts and tax. You can ask
        us to delete the <em>content of your letter</em> at any time after it's delivered, and
        we'll do it — message us on WhatsApp and we'll confirm once it's gone.
      </P>

      <H>Your rights</H>
      <P>
        You can ask us what we hold about you, ask us to correct it, or ask us to delete it.
        Message us on WhatsApp or email {BUSINESS.email} and we'll respond within 7 days.
      </P>

      <H>Payments</H>
      <P>
        We don't collect card or bank details on this website — there is no payment form here.
        When your draft is approved we send a UPI request, and that transaction happens inside
        your own payment app. We never see your card number, UPI PIN or bank credentials.
      </P>

      <H>Children</H>
      <P>This service is intended for people aged 18 and over.</P>
    </Shell>
  )
}

// ── Terms ───────────────────────────────────────────────────
export function Terms() {
  return (
    <Shell
      title="Terms & Conditions"
      description="The terms you agree to when you order a handwritten letter from Ever Yours — drafts, revisions, payment, and what we will and won't write."
      path="/terms"
    >
      <Identity />

      <H>What we do</H>
      <P>
        We write personalised letters by hand in calligraphy, on premium paper, and optionally
        pair them with a curated gift. You tell us the feeling and the details; we find the words.
      </P>

      <H>How an order works</H>
      <UL>
        <li>You place an order on this site. <strong>Nothing is charged at that point.</strong></li>
        <li>We write a draft and send it to you on WhatsApp, normally within 24 hours.</li>
        <li>You can request changes. <strong>One revision is included free.</strong> Further rewrites may be chargeable — we'll always tell you before charging anything.</li>
        <li>Once you approve the draft, we send a UPI payment request.</li>
        <li>After payment we hand-write, seal and dispatch the letter.</li>
      </UL>

      <H>Prices</H>
      <P>
        Prices shown on the site are in Indian Rupees and are calculated when you place the
        order. The total shown on your confirmation is the amount payable after you approve
        the draft. We may change our prices at any time, but never for an order already placed.
      </P>
      {isMissing(BUSINESS.gst) && (
        <P>
          We are not currently GST-registered, so no tax is added on top — the price you
          are quoted is the price you pay. Delivery charges, where they apply, are confirmed
          on WhatsApp before you pay anything.
        </P>
      )}

      <H>What we won't write</H>
      <P>We'll decline an order, and tell you why, if the letter would be used to:</P>
      <UL>
        <li>threaten, harass, stalk, intimidate or abuse anyone;</li>
        <li>impersonate another person in a way meant to deceive;</li>
        <li>defame someone, or spread something you know to be untrue;</li>
        <li>contact someone who has asked you not to contact them.</li>
      </UL>
      <P>
        You confirm that the recipient's details you give us are ones you're entitled to use.
        If we decline an order, nothing is charged.
      </P>

      <H>Your words and our writing</H>
      <P>
        The words and memories you send us remain yours. The finished handwritten piece is
        yours once paid for. We keep the right to photograph our own calligraphy work for our
        portfolio — but never in a way that shows readable personal content, names or addresses,
        and never without asking you first.
      </P>

      <H>Delays outside our control</H>
      <P>
        We aren't liable for delays caused by courier services, postal strikes, weather,
        or an address that turns out to be wrong or incomplete. We'll always help you sort it out.
      </P>

      <H>Limitation</H>
      <P>
        Our liability for any order is limited to the amount you paid for that order.
      </P>

      <H>Governing law</H>
      <P>
        These terms are governed by the laws of India, and disputes fall under the
        jurisdiction of the courts of Bengaluru, Karnataka.
      </P>
    </Shell>
  )
}

// ── Shipping ────────────────────────────────────────────────
export function Shipping() {
  return (
    <Shell
      title="Shipping & Delivery"
      description="Same-day handwritten letter delivery across Bangalore, and PAN-India shipping via India Post. Timelines, charges and surprise deliveries explained."
      path="/shipping"
    >
      <H>Where we deliver</H>
      <UL>
        <li><strong>Bangalore —</strong> same-day delivery via Dunzo or Porter, for orders approved early enough in the day.</li>
        <li><strong>Rest of India —</strong> typically 3–5 business days via India Post.</li>
      </UL>

      <H>When the clock starts</H>
      <P>
        Delivery timelines run from the moment you <strong>approve your draft and pay</strong> —
        not from when you place the order. The draft usually reaches you within 24 hours, so
        the sooner you approve it, the sooner it ships.
      </P>
      <P>
        If your letter is for a specific date, tell us in the special instructions box and
        we'll plan backwards from it. For anything urgent, message us on WhatsApp before ordering
        so we can confirm we can make it.
      </P>

      <H>Charges</H>
      <P>
        Delivery charges, where they apply, are confirmed on WhatsApp along with your draft,
        before you pay anything.
      </P>

      <H>Keeping it a surprise</H>
      <P>
        Tick "It's a surprise" in the order form and we'll contact <em>you</em> rather than the
        recipient for anything delivery-related, so nothing is given away.
      </P>

      <H>If something goes wrong</H>
      <P>
        Wrong or incomplete addresses are the most common cause of failed delivery — please
        double-check the pincode. If a parcel is returned to us, we'll reach out to arrange
        redelivery; a second delivery charge may apply.
      </P>
      <P>
        If your letter arrives damaged, see our <Link to="/refunds" style={{ color: '#9D4433' }} className="underline">Refunds &amp; Cancellation</Link> page.
      </P>
    </Shell>
  )
}

// ── Refunds ─────────────────────────────────────────────────
export function Refunds() {
  return (
    <Shell
      title="Refunds & Cancellation"
      description="How cancellations and refunds work at Ever Yours — you approve the draft before you pay, so there is little to go wrong."
      path="/refunds"
    >
      <H>The short version</H>
      <P>
        <strong>You don't pay until you've read your draft and approved it.</strong> That's
        deliberate — it means you never pay for words you don't love. Most refund problems
        simply never arise.
      </P>

      <H>Cancelling</H>
      <UL>
        <li><strong>Before you approve the draft —</strong> cancel any time, for any reason, at no cost. Nothing has been charged.</li>
        <li><strong>After you approve and pay, before we write —</strong> message us immediately. If we haven't started the calligraphy, we'll refund you in full.</li>
        <li><strong>After we've written it —</strong> the letter is handwritten and personalised to one person, so it can't be resold or reused. We can't refund at this stage.</li>
      </UL>

      <H>If you don't like the draft</H>
      <P>
        Tell us. One revision is included free, and we'd genuinely rather rewrite it than have
        you send something that isn't right. If we still can't get it right, cancel — you won't
        be charged.
      </P>

      <H>Damaged or lost in transit</H>
      <P>
        Send us a photo on WhatsApp within 48 hours of delivery and we'll rewrite and reship
        the letter at no cost. If a parcel is confirmed lost by the courier, we'll rewrite and
        resend it, or refund you in full — your choice.
      </P>

      <H>Gifts</H>
      <P>
        Gift items that arrive damaged are replaced or refunded. Because gifts are curated and
        packed with the letter, we can't accept returns simply because a gift wasn't to taste —
        pick "I'll choose" in the order form if you'd rather select the gift yourself.
      </P>

      <H>How refunds are paid</H>
      <P>
        Refunds go back to the UPI ID you paid from, normally within 5–7 business days of us
        confirming the refund.
      </P>
    </Shell>
  )
}
