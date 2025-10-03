import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [longUrl, setlongUrl] = useState();
  const navigate = useNavigate();
  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) navigate(`/auth?createNew=${longUrl}`);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="my-10 sm:my-16 text-3xl sm:text-6xl lg:text-7xl text-white text-center font-extrabold">
        The only url shortner service you will ever need
      </h2>
      <form
        onSubmit={handleShorten}
        className="sm:h-14 flex flex-col sm:flex-row w-full md:w-2/4 gap-2"
      >
        <Input
          type="url"
          value={longUrl}
          placeholder="Enter your loong url"
          onChange={(e) => setlongUrl(e.target.value)}
          className="h-full flex-1 py-4 px-4"
        />
        <Button className="h-full" type="submit" variant="destructive">
          Shorten!
        </Button>
      </form>
      {/* <img src="/banner.jpg" alt="banner" className="w-full my-11 md:px-11" /> */}
      <Accordion type="multiple" collapsible className="w-full md:px-11">
        <AccordionItem value="item-1">
          <AccordionTrigger>How does LynCut shorten URLs?</AccordionTrigger>
          <AccordionContent>
            LynCut converts long URLs into short, memorable links using a unique
            code system. This makes sharing links faster and easier across
            platforms.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Is LynCut secure?</AccordionTrigger>
          <AccordionContent>
            Absolutely! LynCut ensures secure redirection and protects against
            malicious links. All URLs are validated and encrypted for safety.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>
            Can I track clicks on my shortened links?
          </AccordionTrigger>
          <AccordionContent>
            Yes! LynCut provides detailed analytics including number of clicks,
            locations, devices, and referrers so you can track your link’s
            performance.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>
            What makes LynCut faster than other URL shorteners?
          </AccordionTrigger>
          <AccordionContent>
            LynCut uses a microservices architecture that reduces redirection
            time to 30-40ms, compared to the usual 1400-1800ms in traditional
            systems.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>Can I customize my short URLs?</AccordionTrigger>
          <AccordionContent>
            Yes! LynCut allows users to create custom short codes for their
            URLs, making them easy to remember and brand-friendly.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LandingPage;
