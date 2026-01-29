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
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#0b3b2e] text-[16px] top-[-2px] w-[31px]">86%</p>
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
        <div className="content-stretch flex flex-col items-start pl-0 pr-[120.865px] py-0 relative size-full">
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
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[41.6px] left-0 text-[32px] text-black text-nowrap top-[0.67px] tracking-[-0.32px]">{`Review & Confirm`}</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[-2px]">Review your profile summary and accept our terms to complete your registration.</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[75.188px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Paragraph />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[33.594px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[33.6px] left-0 text-[24px] text-black text-nowrap top-[-0.33px]">Profile Summary</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[25.594px] left-0 top-0 w-[11.99px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#0b3b2e] text-[16px] text-nowrap top-[-2px]">✓</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <Text2 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-[19.99px] not-italic text-[#364153] text-[16px] text-nowrap top-[-2px]">Basic information completed</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute h-[25.594px] left-0 top-0 w-[11.99px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#0b3b2e] text-[16px] text-nowrap top-[-2px]">✓</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <Text3 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-[19.99px] not-italic text-[#364153] text-[16px] top-[-2px] w-[111px]">1 topic selected</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute h-[25.594px] left-0 top-0 w-[13.781px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#99a1af] text-[16px] text-nowrap top-[-2px]">○</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <Text4 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-[21.78px] not-italic text-[#364153] text-[16px] top-[-2px] w-[205px]">Video introduction (optional)</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute h-[25.594px] left-0 top-0 w-[11.99px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#0b3b2e] text-[16px] text-nowrap top-[-2px]">✓</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <Text5 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-[19.99px] not-italic text-[#364153] text-[16px] top-[-2px] w-[196px]">1 availability period defined</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[126.375px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph1 />
      <Paragraph2 />
      <Paragraph3 />
      <Paragraph4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[#f9fafb] h-[225.302px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pb-[0.667px] pt-[24.667px] px-[24.667px] relative size-full">
          <Heading2 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Checkbox() {
  return <div className="absolute left-0 size-[20px] top-[4px]" data-name="Checkbox" />;
}

function Link() {
  return (
    <div className="absolute content-stretch flex h-[18.667px] items-start left-[182.73px] top-[1.33px] w-[123.74px]" data-name="Link">
      <p className="[text-underline-position:from-font] decoration-solid font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] not-italic relative shrink-0 text-[#0b3b2e] text-[14px] text-nowrap underline">{`Terms & Conditions`}</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute content-stretch flex h-[18.667px] items-start left-[310.32px] top-[1.33px] w-[6.083px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] not-italic relative shrink-0 text-[#e7000b] text-[14px] text-nowrap">*</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[22.396px] left-[32px] top-0 w-[316.406px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black top-[-0.67px] w-[183px]">I have read and agree to the</p>
      <Link />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-[306.47px] not-italic text-[14px] text-black text-nowrap top-[-0.67px]">&nbsp;</p>
      <Text6 />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Label">
      <Checkbox />
      <Text7 />
    </div>
  );
}

function Checkbox1() {
  return <div className="absolute left-0 size-[20px] top-[4px]" data-name="Checkbox" />;
}

function Text8() {
  return (
    <div className="absolute h-[22.396px] left-[32px] top-0 w-[240.792px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black text-nowrap top-[-0.67px]">I want to receive the VOXD newsletter</p>
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Label">
      <Checkbox1 />
      <Text8 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#973c00] text-[16px] text-nowrap top-[-2px]">{`You must accept the Terms & Conditions to complete your registration.`}</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[#fffbeb] h-[58.927px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#fee685] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[0.667px] pt-[16.667px] px-[16.667px] relative size-full">
          <Paragraph5 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[138.927px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Label1 />
      <Container7 />
    </div>
  );
}

function TermsNewsletter() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[32px] h-[552.75px] items-start left-[111px] pb-[0.667px] pt-[24.667px] px-[24.667px] rounded-[16.4px] top-[198.93px] w-[672px]" data-name="TermsNewsletter">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[16.4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <Container4 />
      <Container6 />
      <Container8 />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[53.594px] relative rounded-[10px] shrink-0 w-[87.573px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#0b3b2e] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[44px] not-italic text-[#0b3b2e] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Back</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#d1d5dc] h-[53.594px] opacity-60 relative rounded-[10px] shrink-0 w-[147.594px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[74px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[13.33px] translate-x-[-50%]">Submit Profile</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex h-[53.594px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[86.26px] items-start left-0 pb-0 pt-[16.667px] px-[111px] top-[799.68px] w-[894px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.667px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Container9 />
    </div>
  );
}

function ProfileCreation() {
  return (
    <div className="bg-[#f9fafb] h-[885.938px] relative shrink-0 w-full" data-name="ProfileCreation">
      <Header />
      <Container3 />
      <TermsNewsletter />
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