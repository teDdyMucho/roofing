import { Product } from '../types/product';

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: '"Professional Roof Flashing System',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    badge: 'Bestseller',
    variants: [
      {
        id: 'flashing-triangular',
        name: 'Triangular Corner Flashing',
        description:  "Premium triangular corner flashing designed for complex roof intersections. Engineered for superior water diversion and long-lasting protection. Perfect for architectural details and custom roofing applications.",
        price: 120.99,
        originalPrice: 149.99,
        image: "/images/triangular-flashing.png",
        color: '#E5E7EB',
        category: 'roof-flashing'
      },
      {
        id: "flashing-round",
        name: "Round Pipe Flashing",
        description:
          "Professional-grade round pipe flashing with integrated base plate. Provides watertight seal around cylindrical penetrations. Ideal for vent pipes, conduits, and HVAC installations.",
        price: 79.99,
        originalPrice: 99.99,
        image: "/images/round-flashing.png",
        color: "#F3F4F6",
        category: "roof-flashing",
      }
    ]
  },
  {
    id: 2,
    name: '"Waterproof Membrane Systems',
    rating: 4.8,
    reviews: 89,
    inStock: true,
    badge: 'Eco-Friendly',
    variants: [
      {
        id: "membrane-roll",
        name: "Premium Roll Membrane",
        description:
          "High-performance waterproof membrane in convenient roll format. Self-adhesive backing for easy installation. Provides exceptional protection against water infiltration and weather damage.",
        price: 149.99,
        originalPrice: 199.99,
        image: "/images/membrane-roll.png",
        color: "#F8FAFC",
        category: "waterproof-membrane",
      }
    ]
  }
];
