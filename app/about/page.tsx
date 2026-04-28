"use client";

import styled from "styled-components";
import { useLanguage } from "@/lib/useLanguage";

const Wrap = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 22px 0 42px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.15;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Lead = styled.p`
  margin: 12px 0 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 18px 0;
`;

const Section = styled.section`
  margin-top: 18px;
`;

const H3 = styled.h3`
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
`;

const P = styled.p`
  margin: 8px 0 0;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textLight};
`;

const List = styled.ul`
  margin: 10px 0 0;
  padding-left: 18px;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.7;
`;

const Short = styled.div`
  margin-top: 14px;
  display: grid;
  gap: 10px;
`;

const Point = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 12px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const Arrow = styled.div`
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.4;
`;

const PointText = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.4;
`;

export default function AboutPage() {
  const { language } = useLanguage();

  const isAf = language === "af";

  return (
    <Wrap>
      <Title>{isAf ? "Oor PlaasMark" : "About PlaasMark"}</Title>
      <Lead>
        {isAf
          ? "PlaasMark is ’n eenvoudige, plaaslike mark — aanlyn."
          : "PlaasMark is a simple, local marketplace — online."}
      </Lead>

      <Divider />

      <Section>
        <H3>{isAf ? "Wat is PlaasMark?" : "What is PlaasMark?"}</H3>
        <P>
          {isAf
            ? "Ons het dit gebou vir mense wat iets maak met hul hande."
            : "It’s built for people who create things with their hands."}
        </P>
        <P>
          {isAf
            ? "Vars brood, kaas, vleis, gebak, handgemaakte produkte — klein besighede wat nie ’n groot platform nodig het nie, net ’n plek om hul goed te wys en bestellings te bestuur."
            : "Fresh bread, cheese, meat, baked goods, handmade products — small entrepreneurs who don’t need a big platform, just a place to showcase their products and manage orders."}
        </P>
      </Section>

      <Section>
        <H3>{isAf ? "Vir wie is dit?" : "Who is it for?"}</H3>
        <P>
          {isAf
            ? "Vir die ou wat brood bak in sy kombuis. Vir die tannie wat konfyt maak. Vir die vriend wat leerwerk doen na ure."
            : "For the guy baking bread at home. For the lady making jam. For the friend doing leatherwork after hours."}
        </P>
        <P>
          {isAf
            ? "Jy hoef nie ’n “besigheid” te wees nie. Jy hoef net iets te hê wat die moeite werd is om te verkoop."
            : "You don’t need to be a “business”. You just need something worth selling."}
        </P>
      </Section>

      <Section>
        <H3>{isAf ? "Hoe werk dit?" : "How does it work?"}</H3>
        <P>
          {isAf
            ? "PlaasMark is nie ’n betaalplatform nie."
            : "PlaasMark is not a payment platform."}
        </P>
        <List>
          <li>
            {isAf
              ? "vat nie ’n sny van jou geld nie"
              : "don’t take a cut of your money"}
          </li>
          <li>
            {isAf ? "hanteer nie betalings nie" : "don’t handle payments"}
          </li>
        </List>
        <P>{isAf ? "Ons help net met:" : "We simply help you:"}</P>
        <List>
          <li>{isAf ? "produkte wys" : "showcase products"}</li>
          <li>{isAf ? "bestellings neem" : "receive orders"}</li>
          <li>
            {isAf
              ? "en dit maklik maak om alles te bestuur"
              : "manage everything easily"}
          </li>
        </List>
        <P>
          {isAf
            ? "Jy en jou kliënt reël die res — soos dit nog altyd gewerk het."
            : "You and your customer handle the rest — just like it’s always been done."}
        </P>
      </Section>

      <Section>
        <H3>{isAf ? "Hoekom PlaasMark?" : "Why PlaasMark?"}</H3>
        <P>
          {isAf
            ? "Omdat Facebook deurmekaar raak. Omdat WhatsApp nie skaal nie. Omdat klein verkopers beter verdien as hulle eenvoudig kan werk."
            : "Because Facebook gets messy. Because WhatsApp doesn’t scale. Because small sellers deserve simple tools."}
        </P>
        <P>{isAf ? "Ons wil:" : "We want to:"}</P>
        <List>
          <li>
            {isAf
              ? "vertroue bou in klein gemeenskappe"
              : "build trust in local communities"}
          </li>
          <li>
            {isAf
              ? "plaaslike verkopers help groei"
              : "help small sellers grow"}
          </li>
          <li>
            {isAf
              ? "en dit maklik maak om te koop by mense naby jou"
              : "make it easier to support people near you"}
          </li>
        </List>
      </Section>

      <Section>
        <H3>{isAf ? "Waarheen gaan dit?" : "Where is this going?"}</H3>
        <P>{isAf ? "Hier begin ons eenvoudig." : "We’re starting simple."}</P>
        <P>
          {isAf ? "Maar vorentoe wil ons:" : "But going forward we want to:"}
        </P>
        <List>
          <li>
            {isAf
              ? "beter kliënt kommunikasie bou (soos kennisgewings en e-pos)"
              : "improve customer communication (notifications, emails)"}
          </li>
          <li>
            {isAf
              ? "verkopers help om hul bestellings makliker te bestuur"
              : "help sellers manage orders better"}
          </li>
          <li>
            {isAf
              ? "en elke dorp sy eie klein mark gee"
              : "give every town its own local marketplace"}
          </li>
        </List>
      </Section>

      <Section>
        <H3>{isAf ? "In kort" : "In short"}</H3>
        <P>{isAf ? "PlaasMark is:" : "PlaasMark is:"}</P>
        <Short>
          <Point>
            <Arrow>👉</Arrow>
            <PointText>
              {isAf ? "’n Aanlyn boeremark" : "an online farmers market"}
            </PointText>
          </Point>
          <Point>
            <Arrow>👉</Arrow>
            <PointText>
              {isAf
                ? "’n Bestellings platform"
                : "an order management platform"}
            </PointText>
          </Point>
          <Point>
            <Arrow>👉</Arrow>
            <PointText>
              {isAf
                ? "’n Gemeenskap vir plaaslike entrepreneurs"
                : "a community for local entrepreneurs"}
            </PointText>
          </Point>
        </Short>
        <P>
          {isAf
            ? "Van ons dorp. Vir ons mense."
            : "From our town. For our people."}
        </P>
      </Section>
    </Wrap>
  );
}
