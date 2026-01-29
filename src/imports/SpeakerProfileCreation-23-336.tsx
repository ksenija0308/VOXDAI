import svgPaths from "./svg-y4r707fl60";

function Heading() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[48px] left-0 text-[40px] text-black text-nowrap top-[-0.11px] tracking-[-0.8px]">VOXD</p>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[80.889px] items-start left-0 pb-[0.889px] pt-[16px] px-[24px] top-0 w-[1317.333px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0px_0px_0.889px] border-solid inset-0 pointer-events-none" />
      <Heading />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[25.597px] relative shrink-0 w-[131.847px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[16px] text-black text-nowrap top-[-2.22px]">Profile Completion</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[25.597px] relative shrink-0 w-[30.347px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#0b3b2e] text-[16px] top-[-2.22px] w-[31px]">71%</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[25.597px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Container1() {
  return <div className="bg-[#0b3b2e] h-[12px] rounded-[2.98262e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container2() {
  return (
    <div className="bg-[#e5e7eb] h-[12px] relative rounded-[2.98262e+07px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pl-0 pr-[352px] py-0 relative size-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[69.597px] relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-start pb-0 pt-[12px] px-[24px] relative size-full">
          <Container />
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[70.486px] items-start left-0 pb-[0.889px] pt-0 px-[18.667px] top-[80.89px] w-[1317.333px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0px_0px_0.889px] border-solid inset-0 pointer-events-none" />
      <Container3 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[41.597px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[41.6px] left-0 text-[32px] text-black text-nowrap top-[-0.22px] tracking-[-0.32px]">Availability Periods</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[51.194px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#4a5565] text-[16px] top-[-2.22px] w-[612px]">{`Define time periods when you're available for speaking engagements. Event organizers will know when they can send you requests during these periods.`}</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[100.792px] items-start left-[24px] top-[24px] w-[622.222px]" data-name="Container">
      <Heading1 />
      <Paragraph />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M6.66667 1.66667V5" id="Vector" stroke="var(--stroke-0, #0B3B2E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 1.66667V5" id="Vector_2" stroke="var(--stroke-0, #0B3B2E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1da67b80} id="Vector_3" stroke="var(--stroke-0, #0B3B2E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 8.33333H17.5" id="Vector_4" stroke="var(--stroke-0, #0B3B2E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[25.597px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[16px] text-black top-[-2.22px] w-[124px]">0 periods defined</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[25.597px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[-2.22px]">{`Add time ranges when you're available to speak`}</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[51.194px] relative shrink-0 w-[337.389px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex gap-[12px] h-[84.972px] items-center left-[24px] pl-[16.889px] pr-[0.889px] py-[0.889px] rounded-[10px] top-[156.79px] w-[622.222px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.889px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Icon />
      <Container6 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[212.9px] size-[20px] top-[18.79px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M4.16667 10H15.8333" id="Vector" stroke="var(--stroke-0, #0B3B2E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 4.16667V15.8333" id="Vector_2" stroke="var(--stroke-0, #0B3B2E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute border-[#d1d5dc] border-[1.778px] border-solid h-[61.153px] left-[24px] rounded-[10px] top-[265.76px] w-[622.222px]" data-name="Button">
      <Icon1 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[323.4px] not-italic text-[#0b3b2e] text-[16px] text-center text-nowrap top-[13.78px] translate-x-[-50%]">Add Availability Period</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[25.597px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#973c00] text-[16px] text-nowrap top-[-2.22px]">Please add at least one availability period to continue.</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bg-[#fffbeb] content-stretch flex flex-col h-[59.375px] items-start left-[24px] pb-[0.889px] pt-[16.889px] px-[16.889px] rounded-[10px] top-[350.92px] w-[622.222px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#fee685] border-[0.889px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Paragraph3 />
    </div>
  );
}

function AvailabilityCalendar() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.889px] border-solid h-[436.069px] left-[322.67px] rounded-[16.4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[199.38px] w-[672px]" data-name="AvailabilityCalendar">
      <Container5 />
      <Container7 />
      <Button />
      <Container8 />
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[53.153px] relative rounded-[10px] shrink-0 w-[87.139px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#0b3b2e] border-[1.778px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[43.78px] not-italic text-[#0b3b2e] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Back</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#d1d5dc] h-[53.153px] opacity-60 relative rounded-[10px] shrink-0 w-[112.056px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[56px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Continue</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex h-[53.153px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Button2 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[86.042px] items-start left-0 pb-0 pt-[16.889px] px-[322.667px] top-[683.44px] w-[1317.333px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.889px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Container9 />
    </div>
  );
}

function ProfileCreation() {
  return (
    <div className="bg-[#f9fafb] h-[769.486px] relative shrink-0 w-full" data-name="ProfileCreation">
      <Header />
      <Container4 />
      <AvailabilityCalendar />
      <Container10 />
    </div>
  );
}

export default function SpeakerProfileCreation() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Speaker Profile Creation">
      <ProfileCreation />
    </div>
  );
}