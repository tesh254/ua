"use client";

import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Header } from "./components/Header";
import { AlgorithmSection } from "./components/AlgorithmSection";
import { LineChart } from "./components/LineChart";
import { SpringAnimation } from "./components/SpringAnimation";
import { GestureCanvas } from "./components/GestureCanvas";
import { LerpAnimation } from "./components/LerpAnimation";
import { PerlinNoiseAnimation } from "./components/PerlinNoise";
import { QuadTreeVisualization } from "./components/QuadTreeVisualisation";
import { CollisionDemo } from "./components/CollisionDetection";
import { PathFindingDemo } from "./components/PathFinding";
import { VoronoiDemo } from "./components/VoronoiDiagram";
import { BSPDemo } from "./components/BSPVisualisation";

const algorithms = [
  {
    id: "bsp",
    title: "Binary Space Partitioning",
    description:
      "BSP divides space into convex sets by recursively splitting it with hyperplanes. This creates a hierarchical representation of space that's useful for determining visibility, organizing spatial data, and creating procedural layouts.",
    useCases: [
      "Level generation in games",
      "Architectural space division",
      "Visibility determination",
      "Dynamic layout organization",
    ],
    component: BSPDemo,
  },
  {
    id: "voronoi",
    title: "Voronoi Diagram",
    description:
      "Voronoi diagrams partition space into regions based on distance to points in a specific subset of the plane. Each region contains all points closer to its seed point than to any other seed point.",
    useCases: [
      "Proximity analysis",
      "Natural pattern generation",
      "Spatial partitioning",
      "Dynamic layouts",
    ],
    component: VoronoiDemo,
  },
  {
    id: "pathfinding",
    title: "Pathfinding",
    description:
      "Pathfinding is a search algorithm that finds the shortest path between two points in a graph. It is commonly used in games, robotics, and other applications where a robot needs to navigate a complex environment.",
    useCases: [
      "Robotics and AI",
      "Game AI",
      "Navigation and pathfinding",
      "Optimization problems",
    ],
    component: PathFindingDemo,
  },
  {
    id: "collision",
    title: "Collision Detection",
    description:
      "Collision detection is the process of determining when two or more objects in a game or simulation collide with each other. It helps prevent objects from overlapping and causing unwanted behavior.",
    useCases: [
      "Real-time game physics",
      "Game AI",
      "Animation effects",
      "Object interactions",
    ],
    component: CollisionDemo,
  },
  {
    id: "perlin",
    title: "Perlin Noise",
    description:
      "A gradient noise function that creates smooth, natural-looking random variations. Unlike pure random noise, Perlin noise changes gradually and creates organic patterns that can be used for procedural generation and smooth animations.",
    useCases: [
      "Procedural terrain generation",
      "Natural-looking animations",
      "Background effects",
      "Particle movement patterns",
    ],
    component: PerlinNoiseAnimation,
  },
  {
    id: "quadtree",
    title: "QuadTree Spatial Partitioning",
    description:
      "A tree data structure that recursively subdivides space into four quadrants. QuadTrees optimize spatial queries and collision detection by reducing the number of objects that need to be checked in any given area.",
    useCases: [
      "Efficient collision detection",
      "Spatial indexing",
      "Point clustering",
      "Dynamic area queries",
    ],
    component: QuadTreeVisualization,
  },
  {
    id: "ema",
    title: "EMA & Double Exponential Smoothing",
    description: "Exponential Moving Average (EMA) and Double Exponential Smoothing are powerful algorithms for smoothing time-series data and predicting trends. While EMA provides basic smoothing, DES can also capture trends in the data.",
    useCases: [
      "Financial market technical analysis",
      "Sensor data smoothing",
      "Real-time signal processing",
      "Weather data analysis"
    ],
    component: LineChart,
  },
  {
    id: "spring",
    title: "Critically Damped Spring",
    description:
      "Spring physics simulation that creates natural-feeling movement toward a target without oscillation.",
    useCases: [
      "Smooth UI transitions",
      "Custom scroll behaviors",
      "Interactive animations",
      "Physics-based UIs",
    ],
    component: SpringAnimation,
  },
  {
    id: "spline",
    title: "Catmull-Rom Spline",
    description:
      "Creates smooth curves through a series of points while maintaining continuity.",
    useCases: [
      "Gesture trails",
      "Path generation",
      "Animation curves",
      "Data visualization",
    ],
    component: GestureCanvas,
  },
  {
    id: "lerp",
    title: "Linear Interpolation (LERP)",
    description:
      "Smoothly transitions between two values with constant speed, perfect for animations and gradual updates.",
    useCases: [
      "Smooth camera movements",
      "Color transitions",
      "Position animations",
      "Value smoothing",
    ],
    component: LerpAnimation,
  },
];

export default function Home() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-16">
            {algorithms.map((algo) => (
              <AlgorithmSection
                key={algo.id}
                title={algo.title}
                description={algo.description}
                useCases={algo.useCases}
              >
                <algo.component />
              </AlgorithmSection>
            ))}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
