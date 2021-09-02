import React from "react";

import async from "../components/Async";

import {
  Monitor,
  BookOpen,
  Info,
  Crosshair,
  DollarSign,
  Activity,
} from "react-feather";

// All pages that rely on 3rd party components (other than Material-UI) are
// loaded asynchronously, to keep the initial JS bundle to a minimum size

// Dashboards components
const Dashboard = async(() => import("../pages/dashboard"));
const Landing = async(() => import("../pages/landing"));
const Events = async(() => import("../pages/events"));
const Event = async(() => import("../pages/event"));
const Wallet = async(() => import("../pages/walletFunctions"));

const landing = {
  id: "Landing",
  path: "/",
  icon: <Crosshair />,
  containsHome: true,
  component: Events,
};

const eventRoutes = {
  id: "Events",
  icon: <Info />,
  containsHome: true,
  children: [
    {
      id: "UFC265",
      name: "UFC 265",
      path: "/events/ufc256",
      component: Event,
    },
  ],
  component: null,
};

const infoRoutes = {
  id: "Info",
  path: "/info",
  icon: <Info />,
  containsHome: true,
  children: [
    {
      path: "/info/docs",
      name: "Documentation",
      component: Dashboard,
    },
    {
      path: "/info/github",
      name: "Github",
      component: Dashboard,
    },
  ],
  component: null,
};

const walletRoutes = {
  id: "Wallet",
  path: "/wallet",
  icon: <DollarSign />,
  containsHome: true,
  component: Wallet,
};

const landingRoute = {
  id: "Landing",
  path: "/landing",
  icon: <Activity />,
  containsHome: true,
  component: Landing,
};

// Routes using the Presentation layout
export const presentationLayoutRoutes = [landingRoute];

// Routes using the Dashboard layout
export const dashboardLayoutRoutes = [landing, walletRoutes, infoRoutes];

export const noPadDashboardLayoutRoutes = [eventRoutes];

// Routes visible in the sidebar
export const sidebarRoutes = [eventRoutes, walletRoutes, infoRoutes];
