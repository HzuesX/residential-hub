import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Shield, Zap, Heart, Users, Globe, Building2, Mail, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'We prioritize the safety and security of your community with enterprise-grade protection.',
  },
  {
    icon: Zap,
    title: 'Efficiency',
    description: 'Streamlined workflows that save time and reduce administrative overhead.',
  },
  {
    icon: Heart,
    title: 'Community Focused',
    description: 'Built with residents in mind, fostering stronger community connections.',
  },
  {
    icon: Users,
    title: 'Inclusive Design',
    description: 'Accessible to everyone, regardless of technical expertise.',
  },
  {
    icon: Globe,
    title: 'Scalable',
    description: 'From small societies to large townships, we scale with your needs.',
  },
  {
    icon: Target,
    title: 'Reliability',
    description: '99.9% uptime guarantee with robust infrastructure.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              About Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Residential Community Hub
            </h1>
            <p className="text-lg text-muted-foreground">
              We're on a mission to transform how residential communities operate, 
              making society management simpler, more secure, and more connected.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Residential Community Hub was born from a simple observation: managing a residential 
                  society shouldn't be complicated. Whether it's tracking visitors, handling maintenance 
                  requests, or keeping residents informed, the existing solutions were either too complex 
                  or too limited.
                </p>
                <p>
                  We set out to build a platform that brings everything together—security, communication, 
                  payments, and community engagement—into one seamless experience.
                </p>
                <p>
                  Today, we're proud to serve communities across the country, helping thousands of 
                  residents and management teams work together more efficiently.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-3d-lg">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
                  alt="Modern apartment building"
                  className="w-full h-auto hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-muted relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card p-6 rounded-2xl border hover:shadow-3d transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Meet the Founder</h2>
            <p className="text-muted-foreground">
              Passionate about building technology that brings communities together
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card className="overflow-hidden hover:shadow-3d-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src="/founder.png"
                  alt="Prince"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <CardContent className="p-6 text-center relative -mt-16">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-background shadow-lg mb-4">
                  <img
                    src="/founder.png"
                    alt="Prince"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">Prince</h3>
                <p className="text-primary font-medium mb-3">Founder & CEO</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Full Stack Engineer passionate about building scalable applications that make a difference.
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://x.com/iprincekumark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="mailto:princevrse@gmail.com"
                    className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 rounded-full blur-3xl transform translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Have questions or want to learn more about how we can help your community?
              We'd love to hear from you.
            </p>
            <a
              href="mailto:princevrse@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors shadow-lg"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
