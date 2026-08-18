import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { CropFrame } from "@/components/atoms/CropFrame";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-white text-graphite px-5 pt-5 pb-0 flex flex-col gap-10 overflow-x-hidden font-sans">

      {/* 1. Header (Framed with Crop Marks, Flush Left & Right) */}
      <CropFrame className="w-full">
        <header className="w-full flex items-center justify-between px-0 py-3 sm:py-4 bg-white">
          <div className="flex items-center gap-3">
            <Image
              src="/logotype.svg"
              alt="Finali"
              width={84}
              height={30}
              priority
              className="h-6 sm:h-7 w-auto cursor-pointer"
            />
          </div>

          <nav className="flex items-center gap-5 sm:gap-8 text-body font-medium text-graphite">
            <a href="#about" className="hover:opacity-60 transition-opacity hidden sm:inline">About</a>
            <a href="#workflow" className="hover:opacity-60 transition-opacity hidden sm:inline">Workflow</a>
            <a href="#footer" className="hover:opacity-60 transition-opacity hidden sm:inline">Contact</a>
            <Button href="/briefd" variant="solid" size="sm">
              Try Briefd now
            </Button>
          </nav>
        </header>
      </CropFrame>

      {/* 2. Hero Section (Framed with Crop Marks, Flush Left, Lower Height) */}
      <CropFrame className="w-full">
        <section className="w-full px-0 pt-0 pb-6 sm:pb-8 bg-white flex flex-col items-start justify-start">

          {/* H1 Display Headline with Briefd(by finali) cohesive unit */}
          <h1 className="w-full text-graphite max-w-full">
            Stop emailing spreadsheets.<br />
            Run your media plans<br />
            through Briefd<span className="inline-block font-bold text-[0.42em] tracking-tight relative -translate-y-[0.35em] ml-1">(by finali)</span>
          </h1>

          <div className="h-4 sm:h-6" />

          {/* Lead Ingress */}
          <p className="text-lead text-graphite/85 max-w-4xl">
            Static sheets and messy email chains cause version chaos and costly production errors. Briefd translates your media plans into clean, scale-accurate format cards shared via a single live link. Completely free.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
            <Button href="#workflow" variant="solid" size="lg" className="sm:px-9">
              Explore the workflow
            </Button>
            <Button href="#about" variant="outline" size="lg" className="sm:px-9">
              Explore automation
            </Button>
          </div>
        </section>
      </CropFrame>

      {/* 3. Hero Bento Grid (4x2 Unified Background with Solid Overlay Tiles) */}
      <CropFrame className="w-full">
        <section className="relative w-full overflow-hidden bg-white">
          {/* Unified 1-Piece Continuous Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/bento-bg.png"
              alt="Continuous halftone landscape backdrop"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* 4x2 Tile Grid (Transparent windows reveal the underlying continuous image) */}
          <div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {/* Row 1 */}
            {/* Tile 1: Transparent Window (Reveals top-left clouds) */}
            <div className="aspect-square w-full" />

            {/* Tile 2: Solid Plum */}
            <div className="aspect-square w-full bg-plum" />

            {/* Tile 3: Bright Magenta / Pink */}
            <div className="aspect-square w-full bg-magenta text-plum p-5 flex flex-col justify-between overflow-hidden">
              <span className="text-[clamp(0.85rem,1.05vw,1.25rem)] font-bold text-plum">What we do</span>
              <p className="text-[clamp(1.45rem,2.4vw,3.2rem)] font-bold leading-[1.05] tracking-tight">
                Briefd<span className="inline-block font-bold text-[0.42em] tracking-tight relative -translate-y-[0.35em] ml-1 mr-1.5">(by finali)</span>bridges media planning and creative production in three steps.
              </p>
            </div>

            {/* Tile 4: Sky Cyan */}
            <div className="aspect-square w-full bg-cyan text-petrol p-5 flex flex-col justify-between overflow-hidden">
              <span className="text-[clamp(0.85rem,1.05vw,1.25rem)] font-bold text-petrol">Why Briefd?</span>
              <div className="flex flex-col gap-2.5">
                <h4 className="text-[clamp(1rem,1.3vw,1.6rem)] font-bold leading-snug tracking-tight">
                  Setting a new visual standard for media planning.
                </h4>
                <p className="text-[clamp(0.75rem,0.92vw,1.1rem)] font-normal leading-[1.38]">
                  We built Briefd (by Finali) as a focused, lightweight tool to eliminate spreadsheet chaos for media agencies, brand managers, and production teams.
                </p>
                <p className="text-[clamp(0.75rem,0.92vw,1.1rem)] font-normal leading-[1.38]">
                  By creating a clean visual workspace for campaign delivery, we are building the industry&apos;s most reliable ad spec ecosystem while laying the foundation for next-generation automated artwork production.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            {/* Tile 5: Taupe / Brown */}
            <div className="aspect-square w-full bg-taupe text-yellow p-5 flex flex-col justify-between overflow-hidden">
              <span className="text-[clamp(0.85rem,1.05vw,1.25rem)] font-bold text-yellow">Who we are</span>
              <p className="text-[clamp(0.85rem,1.05vw,1.25rem)] font-normal leading-relaxed text-yellow">
                Designers and technologists who spent years inside agencies. We know the quiet dread of receiving a 47-row spreadsheet on a Friday afternoon and being expected to deliver production-ready artwork across thirty placements by Monday morning.
              </p>
            </div>

            {/* Tile 6: Transparent Window (Reveals middle-bottom clouds & horizon) */}
            <div className="aspect-square w-full" />

            {/* Tile 7: Solid Bright Yellow */}
            <div className="aspect-square w-full bg-yellow" />

            {/* Tile 8: Transparent Window (Reveals bottom-right sea & horizon) */}
            <div className="aspect-square w-full" />
          </div>
        </section>
      </CropFrame>

      {/* 4. Section: Translation Problem & Video Placeholder (Framed with Crop Marks, No Gray Borders) */}
      <CropFrame className="w-full">
        <section className="w-full bg-light p-6 sm:p-10 md:p-14 flex flex-col gap-6 sm:gap-10">
          <h2 className="h2 text-graphite w-full">
            This is not a technology problem.<br />
            It is a translation problem.
          </h2>

          {/* Video / Animation Placeholder Box (internal note to the team) */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] min-h-[300px] md:min-h-[440px] bg-white flex flex-col items-center justify-center text-center gap-2 p-8">
            <span className="text-ui font-medium text-graphite/50">Internal note</span>
            <span className="text-lead font-medium text-graphite/70 max-w-3xl">
              Animation eller förklarande video, eller illustration av något slag.
            </span>
          </div>
        </section>
      </CropFrame>

      {/* 5. Section: One link for the entire team (Framed with Crop Marks) */}
      <CropFrame className="w-full">
        <section className="w-full bg-petrol text-cyan px-6 sm:px-12 md:px-20 py-16 sm:py-24 md:py-30 flex flex-col items-center justify-center text-center gap-6">
          <h2 className="h1 text-cyan max-w-5xl">
            One link for the<br />
            entire team
          </h2>
          <p className="text-lead text-cyan/90 max-w-4xl">
            Share with your designers, media agency, and client. Everyone<br className="hidden md:inline" /> stays aligned to the latest live specs without version conflicts.
          </p>
        </section>
      </CropFrame>

      {/* 6. Section: Turn rows into live format cards (50/50 Split with 20px gap) */}
      <CropFrame className="w-full">
        <section className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Left Column: Text */}
          <div className="flex flex-col justify-center p-6 sm:p-10 md:p-14 lg:p-16 gap-5 md:gap-6">
            <h2 className="h2 text-graphite">
              Turn rows into live<br />
              format cards.
            </h2>
            <p className="text-lead text-graphite max-w-xl">
              No more deciphering dense spreadsheets.<br className="hidden sm:inline" />
              Every placement becomes a visual card<br className="hidden sm:inline" />
              with exact dimensions, deadlines, and<br className="hidden sm:inline" />
              publisher spec links.
            </p>
          </div>

          {/* Right Column: Halftone Artwork */}
          <div className="w-full min-h-[380px] md:min-h-[520px] relative overflow-hidden bg-light">
            <Image
              src="/turn-rows-art.png"
              alt="Halftone cloud artwork"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </section>
      </CropFrame>

      {/* 7. Section: How it works (Full Cyan Background with 20px gap floating cards) */}
      <div id="workflow" className="w-full">
        <CropFrame className="w-full">
          <section className="w-full bg-cyan p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col gap-6 sm:gap-10">
            {/* Centered Heading */}
            <div className="w-full text-center">
              <h2 className="h1 leading-none text-petrol">
                How it works
              </h2>
            </div>

            {/* 3 Floating Step Cards with 20px gaps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              {/* Step 1 */}
              <div className="bg-petrol text-cyan p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[320px] md:min-h-[380px]">
                <div>
                  <span className="h2 text-cyan leading-none block mb-4">1</span>
                  <h3 className="h3 text-cyan leading-tight">
                    Drop the<br />
                    spreadsheet.
                  </h3>
                </div>
                <p className="text-body text-cyan/90 mt-6">
                  Drop in your .xlsx plan. Briefd parses formats, dimensions, publishers, and delivery dates automatically without rigid templates.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-petrol text-cyan p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[320px] md:min-h-[380px]">
                <div>
                  <span className="h2 text-cyan leading-none block mb-4">2</span>
                  <h3 className="h3 text-cyan leading-tight">
                    Review the<br />
                    format grid.
                  </h3>
                </div>
                <p className="text-body text-cyan/90 mt-6">
                  Every placement turns into a visual card showing true aspect ratios, measurements, and direct links to publisher requirements.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-petrol text-cyan p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[320px] md:min-h-[380px]">
                <div>
                  <span className="h2 text-cyan leading-none block mb-4">3</span>
                  <h3 className="h3 text-cyan leading-tight">
                    Share the<br />
                    live link.
                  </h3>
                </div>
                <p className="text-body text-cyan/90 mt-6">
                  Generate a shareable URL. Designers copy dimensions with a single click while planners keep full control over deliveries.
                </p>
              </div>
            </div>
          </section>
        </CropFrame>
      </div>

      {/* 8. Section: How we view technology (50/50 Split with 20px gap) */}
      <div id="about" className="w-full">
        <CropFrame className="w-full">
          <section className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left Column: Halftone Artwork */}
            <div className="w-full min-h-[380px] md:min-h-[500px] relative overflow-hidden bg-light">
              <Image
                src="/tech-art.png"
                alt="Halftone tech artwork"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Right Column: Text */}
            <div className="flex flex-col justify-center p-6 sm:p-10 md:p-14 lg:p-16 gap-5 md:gap-6">
              <h2 className="h2 text-graphite">
                How we view<br />
                technology
              </h2>
              <p className="text-lead text-graphite max-w-xl">
                We treat automation and machine learning as quiet backend plumbing, never as a pitch. Our systems handle the repetitive, mechanical grunt work that pulls designers away from actual thinking. The creative direction stays entirely human.
              </p>
            </div>
          </section>
        </CropFrame>
      </div>

      {/* 9. Section: Finali Coming Soon Tease (Framed with Crop Marks, Plum & Magenta Palette) */}
      <div id="finali" className="w-full">
        <CropFrame className="w-full">
          <section className="w-full bg-plum text-magenta px-6 sm:px-12 md:px-20 py-20 sm:py-28 md:py-32 flex flex-col items-center justify-center text-center gap-6 md:gap-8">
            <span className="text-body font-bold text-magenta/80">Coming soon</span>
            <h2 className="h1 text-magenta max-w-5xl">
              Automated final art<br />
              delivery service
            </h2>
            <p className="text-lead text-magenta/90 max-w-3xl">
              From approved master design to 30 production-ready files in seconds. Sounds too good? Well, you will see soon.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Button
                href="mailto:early@finali.io?subject=Early%20Access%20Finali"
                variant="contrast"
                size="lg"
                className="sm:px-10"
              >
                Request early access
              </Button>
            </div>
          </section>
        </CropFrame>
      </div>

      {/* 10. Full-Bleed Corporate Footer (0px Margins, Compact Text Size) */}
      <footer id="footer" className="-mx-5 w-[calc(100%+2.5rem)] bg-taupe text-yellow px-6 sm:px-10 md:px-14 py-12 sm:py-16 md:py-20 flex flex-col justify-between gap-10 sm:gap-12">

        {/* Top Tier: Logotype, Mission & Multi-column Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 pb-10 border-b border-yellow/20 text-[0.82rem] sm:text-[0.88rem]">

          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3 max-w-sm">
            <Image
              src="/logotype.svg"
              alt="Finali"
              width={84}
              height={30}
              className="h-6 sm:h-7 w-auto cursor-pointer invert"
            />
            <p className="text-yellow/85 leading-relaxed mt-1">
              The connective infrastructure between media planning and creative execution. Built by agency veterans in Stockholm.
            </p>
          </div>

          {/* Product Col */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-yellow">Product</span>
            <div className="flex flex-col gap-1.5 text-yellow/85">
              <a href="#workflow" className="hover:text-yellow hover:underline transition-all">Briefd (Free Utility)</a>
              <a href="#about" className="hover:text-yellow hover:underline transition-all">Finali Automation (Coming Soon)</a>
              <a href="#workflow" className="hover:text-yellow hover:underline transition-all">Supported Formats</a>
              <a href="#about" className="hover:text-yellow hover:underline transition-all">Spec Hub Database</a>
            </div>
          </div>

          {/* Company Col */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-yellow">Company</span>
            <div className="flex flex-col gap-1.5 text-yellow/85">
              <a href="#about" className="hover:text-yellow hover:underline transition-all">About Us</a>
              <a href="#workflow" className="hover:text-yellow hover:underline transition-all">Media Agency Network</a>
              <a href="#about" className="hover:text-yellow hover:underline transition-all">Design Philosophy</a>
              <a href="mailto:hello@finali.io" className="hover:text-yellow hover:underline transition-all">Contact & Inquiries</a>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Office Locations & Copyright */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[0.75rem] font-medium text-yellow/75">
          <div className="flex flex-wrap items-center gap-4">
            <span>Stockholm, Sweden</span>
            <span>·</span>
            <span>Finali</span>
          </div>
          <span>© 2026 Briefd (by Finali). All rights reserved.</span>
        </div>
      </footer>

    </main>
  );
}
