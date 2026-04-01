import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Cpu, Shield, Zap, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Cpu,
    title: 'High Performance',
    description:
      'Lightning-fast processing speeds for seamless user experience.',
  },
  {
    icon: Shield,
    title: 'Enhanced Security',
    description:
      'Advanced encryption and security protocols to keep your data safe.',
  },
  {
    icon: Zap,
    title: 'Energy Efficient',
    description: 'Optimized power consumption for longer battery life.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Compatibility',
    description: 'Fully responsive design that works on all devices.',
  },
]

export default function ProductFeatureShowcase() {
  return (
    <div className="container py-12 sm:pt-16 md:pt-20">
      <h2 className="mb-12 bg-linerar-to-r from-white to-white/40 bg-clip-text text-center text-2xl font-bold text-transparent sm:text-3xl md:text-4xl">
        Product Features
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="group bg-card transition-colors duration-300"
            >
              <CardHeader className="flex flex-col items-center">
                <div className="flex aspect-square w-12 items-center justify-center  border transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4 text-center text-xl font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
