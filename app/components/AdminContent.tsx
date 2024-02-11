

import { useEffect } from 'react';
import Assistant from "./Assistant";
import Thread from "./Thread";
import Run from "./Run";

const AdminContent = () => {
  useEffect(() => {
    const handleClick = () => {
      const content = document.getElementById('accordion-collapse-body-1');
      const expanded = content?.getAttribute('aria-expanded') === 'true' || false;
      content?.setAttribute('aria-expanded', String(!expanded));
      content?.classList.toggle('hidden');
    };

    const button = document.querySelector('[data-accordion-target="#accordion-collapse-body-1"]');
    button?.addEventListener('click', handleClick);

    return () => {
      button?.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className='mb-4'>
        <h2 id="accordion-collapse-heading-1">
        <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1">
            <span>Open Actions Menu</span>
            <svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
            </svg>
        </button>
        </h2>
        <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-row gap-x-10">
                <Assistant />
                {/* <AssistantFile /> */}
                {/* <SpeechGenerator textData={"Here we will pass assistant text message"} /> */}
                <Thread />
                <Run />
            </div>
        </div>
    </div>
  );
};

export default AdminContent;