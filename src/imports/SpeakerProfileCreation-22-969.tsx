import svgPaths from "./svg-kp2g0dhqgs";

function Heading() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[48px] left-0 text-[40px] text-black text-nowrap top-[0.33px] tracking-[-0.8px]">VOXD</p>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[80.667px] items-start left-0 pb-[0.667px] pt-[16px] px-[24px] top-0 w-[894px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0px_0px_0.667px] border-solid inset-0 pointer-events-none" />
      <Heading />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-[131.844px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[16px] text-black text-nowrap top-[-2px]">Profile Completion</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-[30.344px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#0b3b2e] text-[16px] top-[-2px] w-[31px]">71%</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[25.594px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Container1() {
  return <div className="bg-[#0b3b2e] h-[12px] rounded-[2.23696e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container2() {
  return (
    <div className="bg-[#e5e7eb] h-[12px] relative rounded-[2.23696e+07px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pl-0 pr-[241.719px] py-0 relative size-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] h-[69.594px] items-start left-0 pb-[0.667px] pt-[12px] px-[24px] top-[80.67px] w-[894px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.667px] border-black border-solid inset-0 pointer-events-none" />
      <Container />
      <Container2 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[41.594px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[41.6px] left-0 text-[32px] text-black text-nowrap top-[0.67px] tracking-[-0.32px]">Availability Periods</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[51.188px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#4a5565] text-[16px] top-[-2px] w-[612px]">{`Define time periods when you're available for speaking engagements. Event organizers will know when they can send you requests during these periods.`}</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[100.781px] items-start relative shrink-0 w-full" data-name="Container">
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
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[16px] text-black top-[-2px] w-[124px]">0 periods defined</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[-2px]">{`Add time ranges when you're available to speak`}</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[51.188px] relative shrink-0 w-[337.385px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[#f9fafb] h-[84.521px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16.667px] pr-[0.667px] py-[0.667px] relative size-full">
          <Icon />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[33.594px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[33.6px] left-0 text-[24px] text-black text-nowrap top-[-0.33px]">Add New Availability Period</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute content-stretch flex h-[18.667px] items-start left-[67.7px] top-[1.33px] w-[6.083px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] not-italic relative shrink-0 text-[#e7000b] text-[14px] text-nowrap">*</p>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[22.396px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black text-nowrap top-[-0.67px]">Start Date</p>
      <Text2 />
    </div>
  );
}

function DatePicker() {
  return (
    <div className="bg-white h-[50.927px] relative rounded-[6.8px] shrink-0 w-full" data-name="Date Picker">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6.8px]" />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[114.917px] items-start left-0 top-0 w-[277.333px]" data-name="Container">
      <Label />
      <DatePicker />
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute content-stretch flex h-[18.667px] items-start left-[61.31px] top-[1.33px] w-[6.083px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] not-italic relative shrink-0 text-[#e7000b] text-[14px] text-nowrap">*</p>
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute h-[22.396px] left-0 top-0 w-[277.333px]" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black text-nowrap top-[-0.67px]">End Date</p>
      <Text3 />
    </div>
  );
}

function DatePicker1() {
  return <div className="absolute bg-white border-[#d1d5dc] border-[0.667px] border-solid h-[50.927px] left-0 rounded-[6.8px] top-[30.4px] w-[277.333px]" data-name="Date Picker" />;
}

function Checkbox() {
  return <div className="absolute left-0 size-[13px] top-[4.7px]" data-name="Checkbox" />;
}

function Text4() {
  return (
    <div className="absolute h-[22.396px] left-[21px] top-0 w-[55.813px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[-0.67px]">Ongoing</p>
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute h-[22.396px] left-0 top-[90.96px] w-[76.813px]" data-name="Label">
      <Checkbox />
      <Text4 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[114.917px] left-[293.33px] top-0 w-[277.333px]" data-name="Container">
      <Label1 />
      <DatePicker1 />
      <Label2 />
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[114.917px] relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#d1d5dc] h-[53.594px] opacity-50 relative rounded-[10px] shrink-0 w-[127.167px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[64.5px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Add Period</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[53.594px] relative rounded-[10px] shrink-0 w-[101.813px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#0b3b2e] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[51.5px] not-italic text-[#0b3b2e] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Cancel</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[12px] h-[53.594px] items-start relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[rgba(11,59,46,0.05)] h-[286.104px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#0b3b2e] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2px] pt-[26px] px-[26px] relative size-full">
          <Heading2 />
          <Container9 />
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function AvailabilityCalendar() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[32px] h-[600.74px] items-start left-[111px] pb-[0.667px] pt-[24.667px] px-[24.667px] rounded-[16.4px] top-[198.93px] w-[672px]" data-name="AvailabilityCalendar">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[16.4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <Container4 />
      <Container6 />
      <Container11 />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[53.594px] relative rounded-[10px] shrink-0 w-[87.573px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#0b3b2e] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[44px] not-italic text-[#0b3b2e] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Back</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#d1d5dc] h-[53.594px] opacity-60 relative rounded-[10px] shrink-0 w-[112.052px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[56px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Continue</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex h-[53.594px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[86.26px] items-start left-0 pb-0 pt-[16.667px] px-[111px] top-[847.67px] w-[894px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.667px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Container12 />
    </div>
  );
}

function ProfileCreation() {
  return (
    <div className="bg-[#f9fafb] h-[933.927px] relative shrink-0 w-full" data-name="ProfileCreation">
      <Header />
      <Container3 />
      <AvailabilityCalendar />
      <Container13 />
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