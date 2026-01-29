import svgPaths from "./svg-oetxg1zsuq";

function Heading() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[48px] left-0 text-[40px] text-black text-nowrap top-[0.33px] tracking-[-0.8px]">VOXD</p>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex flex-col h-[80.667px] items-start left-0 pb-[0.667px] pt-[16px] px-[24px] top-0 w-[1262.667px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0px_0px_0.667px] border-solid inset-0 pointer-events-none" />
      <Heading />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[41.594px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[41.6px] left-[224.65px] text-[32px] text-black text-center text-nowrap top-[0.67px] tracking-[-0.32px] translate-x-[-50%]">Create Your Speaker Profile</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[51.188px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-[224.38px] not-italic text-[#4a5565] text-[16px] text-center top-[-2px] translate-x-[-50%] w-[439px]">Join VOXD and become discoverable for event organisers who are looking for the speaker like you</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[100.781px] items-start left-0 top-0 w-[448px]" data-name="Container">
      <Heading1 />
      <Paragraph />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[124.14px] size-[20px] top-[16.79px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_22_630)" id="Icon">
          <path d={svgPaths.p72dbc10} fill="var(--fill-0, black)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_22_630">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[53.594px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Icon />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[240.14px] not-italic text-[16px] text-black text-center text-nowrap top-[12px] translate-x-[-50%]">Continue with LinkedIn</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[128.64px] size-[20px] top-[16.79px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p30690780} fill="var(--fill-0, #4285F4)" id="Vector" />
          <path d={svgPaths.p9890e00} fill="var(--fill-0, #34A853)" id="Vector_2" />
          <path d={svgPaths.p37f2d600} fill="var(--fill-0, #FBBC05)" id="Vector_3" />
          <path d={svgPaths.p3b476700} fill="var(--fill-0, #EA4335)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[53.594px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Icon1 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[239.64px] not-italic text-[16px] text-black text-center text-nowrap top-[12px] translate-x-[-50%]">Continue with Google</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[119.188px] items-start left-0 top-[132.78px] w-[448px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[22.396px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black text-nowrap top-[-0.67px]">Email Address</p>
    </div>
  );
}

function EmailInput() {
  return (
    <div className="absolute bg-white h-[50.927px] left-0 rounded-[6.8px] top-0 w-[448px]" data-name="Email Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.5)] text-nowrap">you@example.com</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6.8px]" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[15.46px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p24d83580} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pd919a80} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[50.927px] relative shrink-0 w-full" data-name="Container">
      <EmailInput />
      <Icon2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[81.323px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container2 />
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[22.396px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black text-nowrap top-[-0.67px]">Password</p>
    </div>
  );
}

function PasswordInput() {
  return (
    <div className="absolute bg-white h-[50.927px] left-0 rounded-[6.8px] top-0 w-[448px]" data-name="Password Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[48px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.5)] text-nowrap">••••••••</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6.8px]" />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[15.46px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2566d000} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1bf79e00} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[20.84%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-7.14%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3342 13.3323">
            <path d={svgPaths.pcb0000} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.66667 6.66667">
            <path d={svgPaths.p2314a170} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[416px] size-[20px] top-[15.46px]" data-name="Button">
      <Icon4 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[50.927px] relative shrink-0 w-full" data-name="Container">
      <PasswordInput />
      <Icon3 />
      <Button2 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[25.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[-2px]">Min 8 characters, 1 uppercase, 1 number</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[110.917px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Container4 />
      <Paragraph1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[22.396px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.4px] left-0 not-italic text-[14px] text-black text-nowrap top-[-0.67px]">Confirm Password</p>
    </div>
  );
}

function PasswordInput1() {
  return (
    <div className="absolute bg-white h-[50.927px] left-0 rounded-[6.8px] top-0 w-[448px]" data-name="Password Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.5)] text-nowrap">••••••••</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6.8px]" />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[15.46px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2566d000} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1bf79e00} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[50.927px] relative shrink-0 w-full" data-name="Container">
      <PasswordInput1 />
      <Icon5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[81.323px] items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <Container6 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#0b3b2e] h-[49.594px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[224.29px] not-italic text-[16px] text-center text-nowrap text-white top-[11.33px] translate-x-[-50%]">Create Account</p>
    </div>
  );
}

function Form() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[371.156px] items-start left-0 top-[325.56px] w-[448px]" data-name="Form">
      <Container3 />
      <Container5 />
      <Container7 />
      <Button3 />
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute h-[25.594px] left-[104.73px] top-[720.72px] w-[238.542px]" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[25.6px] left-[119.5px] not-italic text-[#0b3b2e] text-[16px] text-center text-nowrap top-[-2px] translate-x-[-50%]">Already have an account? Sign in</p>
    </div>
  );
}

function Container8() {
  return <div className="absolute border-[#d1d5dc] border-[0.667px_0px_0px] border-solid h-[0.667px] left-0 top-[12.46px] w-[448px]" data-name="Container" />;
}

function Text() {
  return (
    <div className="absolute bg-white h-[25.594px] left-[200.53px] top-0 w-[46.938px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] left-[16px] not-italic text-[#6a7282] text-[16px] text-nowrap top-[-2px]">or</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[25.594px] left-0 top-[275.97px] w-[448px]" data-name="Container">
      <Container8 />
      <Text />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[746.313px] left-[407.33px] top-[128.67px] w-[448px]" data-name="Container">
      <Container />
      <Container1 />
      <Form />
      <Button4 />
      <Container9 />
    </div>
  );
}

export default function SpeakerProfileCreation() {
  return (
    <div className="bg-white relative size-full" data-name="Speaker Profile Creation">
      <Header />
      <Container10 />
    </div>
  );
}
