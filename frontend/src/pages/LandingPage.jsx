import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AgentsSection from '../components/landing/AgentsSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import WhyAegisSphere from '../components/landing/WhyAegisSphere';
import FaqSection from '../components/landing/FaqSection';
import LandingFooter from '../components/landing/LandingFooter';
import '../styles/landing.css';

export const LandingPage = () => {
  return (
    <div className="landing-root">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AgentsSection />
        <WorkflowSection />
        <WhyAegisSphere />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
