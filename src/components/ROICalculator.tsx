"use client";

import React, { useState } from "react";

export function ROICalculator() {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(15);

  // Calculation parameters:
  // Estimated average hourly rate for DTP / Final Art: €65/h
  // Finali automates ~75% of repetitive adaptation toil
  const hourlyRate = 65;
  const savingsFactor = 0.75;
  const annualHours = teamSize * hoursPerWeek * 52;
  const annualSavings = Math.round(annualHours * hourlyRate * savingsFactor);

  const formattedSavings = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(annualSavings);

  return (
    <div className="w-full bg-[#173537] text-[#84CCEF] p-8 md:p-14 flex flex-col gap-10">
      {/* Header & Subtext */}
      <div className="flex flex-col gap-4 text-left max-w-4xl">
        <h2 className="text-4xl md:text-6xl lg:text-[72px] font-semibold tracking-tight leading-[1.06] text-[#84CCEF]">
          Stop Bleeding Hours on DTP.
        </h2>
        <p className="text-lg md:text-xl font-normal text-[#84CCEF]/90 leading-relaxed tracking-normal">
          Manual format adaptation eats up to 40% of an agency's creative time. When design goes over time, pre-press gets squeezed, resulting in costly errors and overtime. Use our calculator to see the exact financial impact of automating your final art process.
        </p>
      </div>

      {/* Sliders & Dynamic Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-6 border-t border-[#84CCEF]/20">
        
        {/* Sliders Container (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Slider 1: Team Size */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-base md:text-lg font-medium text-[#84CCEF]">
              <label htmlFor="team-size-slider">Number of final artists / designers in your team</label>
              <span className="font-mono text-xl font-bold bg-[#84CCEF] text-[#173537] px-3 py-1">
                {teamSize} {teamSize === 1 ? "person" : "people"}
              </span>
            </div>
            <input
              id="team-size-slider"
              type="range"
              min="1"
              max="50"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full h-2 bg-[#84CCEF]/30 appearance-none cursor-pointer accent-[#84CCEF]"
            />
            <div className="flex justify-between text-xs text-[#84CCEF]/60 font-mono">
              <span>1</span>
              <span>25</span>
              <span>50+</span>
            </div>
          </div>

          {/* Slider 2: Hours spent */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-base md:text-lg font-medium text-[#84CCEF]">
              <label htmlFor="hours-slider">Average hours spent on format adaptations per week (per person)</label>
              <span className="font-mono text-xl font-bold bg-[#84CCEF] text-[#173537] px-3 py-1">
                {hoursPerWeek} hrs/week
              </span>
            </div>
            <input
              id="hours-slider"
              type="range"
              min="5"
              max="40"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-[#84CCEF]/30 appearance-none cursor-pointer accent-[#84CCEF]"
            />
            <div className="flex justify-between text-xs text-[#84CCEF]/60 font-mono">
              <span>5 hrs</span>
              <span>20 hrs</span>
              <span>40 hrs</span>
            </div>
          </div>

        </div>

        {/* Dynamic Output Box (5 cols) */}
        <div className="lg:col-span-5 bg-[#84CCEF] text-[#173537] p-8 flex flex-col justify-between gap-6 border-2 border-[#84CCEF]">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold opacity-80">
              Annual savings estimate
            </span>
            <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-mono">
              {formattedSavings}
            </div>
            <p className="text-xs font-medium opacity-80 mt-1">
              Based on {annualHours.toLocaleString()} annual DTP hours saved across your team.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-block text-center bg-[#173537] text-[#84CCEF] px-8 py-4 text-xs font-medium tracking-normal rounded-none hover:rounded-[30px] transition-[border-radius,background-color,color] duration-500 ease-in-out cursor-pointer"
          >
            See How We Do It
          </a>
        </div>

      </div>
    </div>
  );
}
