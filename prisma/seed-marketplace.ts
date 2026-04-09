import { PrismaClient, StaffRole, OrgType, MarketplaceBookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Marketplace data...");

  // ── Find or create organization ────────────────
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Pixelvo", type: OrgType.HEADQUARTERS },
    });
    console.log("  Created organization: Pixelvo");
  } else {
    console.log(`  Using existing organization: ${org.name}`);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // ── 8 Sample Photographers ─────────────────────
  const photographerData = [
    {
      user: { name: "Sarah Chen", email: "sarah@pixelvo.com" },
      profile: {
        username: "sarah-chen",
        businessName: "Sarah Chen Photography",
        tagline: "Capturing love stories across Europe",
        bio: "With over 12 years of experience in wedding and portrait photography, I specialize in creating timeless, editorial-style imagery. My approach blends photojournalism with fine art to tell your unique story. Based in Paris, I travel throughout Europe and beyond for destination weddings and special occasions. My work has been featured in Vogue Paris, Elle Mariage, and Martha Stewart Weddings.",
        specialties: ["wedding", "portrait", "event"],
        equipment: ["Canon R5", "Canon RF 28-70mm f/2L", "Canon RF 85mm f/1.2L", "Profoto B10 Plus"],
        languages: ["English", "French", "Mandarin"],
        city: "Paris",
        country: "France",
        hourlyRate: 200,
        priceRange: "€200-€400/hour",
        averageRating: 4.9,
        totalReviews: 38,
        completedSessions: 185,
        responseTime: "Within 1 hour",
        experience: "10+ years",
      },
      services: [
        { name: "Wedding Photography", description: "Full-day wedding coverage including getting ready, ceremony, portraits, and reception. Includes online gallery with 500+ edited photos.", startingAt: 2500, duration: "8-10 hours" },
        { name: "Engagement Session", description: "Romantic couple session at a Parisian landmark or countryside location of your choice.", startingAt: 350, duration: "1.5 hours" },
        { name: "Portrait Session", description: "Professional headshots or creative portraits in studio or on location.", startingAt: 180, duration: "1 hour" },
      ],
    },
    {
      user: { name: "Marcus Dubois", email: "marcus@pixelvo.com" },
      profile: {
        username: "marcus-dubois",
        businessName: "Dubois Visual",
        tagline: "Bold visuals for bold brands",
        bio: "I am a commercial and event photographer with a passion for high-energy environments. From corporate galas to music festivals, I thrive in dynamic settings where no two moments are alike. My editorial background gives every project a polished, magazine-ready quality. Currently based in London, working with clients across the UK and internationally.",
        specialties: ["commercial", "event", "portrait"],
        equipment: ["Sony A7R V", "Sony 24-70mm f/2.8 GM II", "Sony 70-200mm f/2.8 GM II", "Godox AD600 Pro"],
        languages: ["English", "French"],
        city: "London",
        country: "United Kingdom",
        hourlyRate: 175,
        priceRange: "€175-€350/hour",
        averageRating: 4.7,
        totalReviews: 27,
        completedSessions: 142,
        responseTime: "Within 2 hours",
        experience: "5-10 years",
      },
      services: [
        { name: "Event Coverage", description: "Professional event photography for corporate events, conferences, and private celebrations.", startingAt: 500, duration: "4 hours" },
        { name: "Commercial Shoot", description: "Brand photography, product shoots, and corporate headshots with full post-production.", startingAt: 400, duration: "3 hours" },
        { name: "Portrait Session", description: "Executive portraits and creative headshots in studio or on location.", startingAt: 150, duration: "1 hour" },
      ],
    },
    {
      user: { name: "Elena Volkov", email: "elena@pixelvo.com" },
      profile: {
        username: "elena-volkov",
        businessName: "Elena Volkov Studio",
        tagline: "Artful family moments, naturally captured",
        bio: "Family and maternity photography is my calling. I believe the most beautiful photos come from genuine connections and natural interactions. My sessions are relaxed, fun, and designed to capture the authentic bond between family members. Based in Barcelona, I work primarily outdoors using the gorgeous Mediterranean light to create warm, sun-kissed imagery.",
        specialties: ["family", "maternity", "portrait"],
        equipment: ["Nikon Z8", "Nikon Z 50mm f/1.2", "Nikon Z 85mm f/1.2", "Reflectors"],
        languages: ["English", "Spanish", "Russian"],
        city: "Barcelona",
        country: "Spain",
        hourlyRate: 120,
        priceRange: "€120-€250/hour",
        averageRating: 5.0,
        totalReviews: 45,
        completedSessions: 200,
        responseTime: "Within 1 hour",
        experience: "10+ years",
      },
      services: [
        { name: "Family Session", description: "Relaxed outdoor family session capturing natural interactions and genuine smiles. Includes 30+ edited photos.", startingAt: 180, duration: "1.5 hours" },
        { name: "Maternity Session", description: "Beautiful maternity portraits celebrating this special time. Indoor or outdoor options available.", startingAt: 150, duration: "1 hour" },
        { name: "Newborn Session", description: "Gentle, safe newborn photography in the comfort of your home or my studio.", startingAt: 200, duration: "2 hours" },
        { name: "Family + Maternity Bundle", description: "Combined maternity and family session with extended editing.", startingAt: 300, duration: "2.5 hours" },
      ],
    },
    {
      user: { name: "James Okonkwo", email: "james@pixelvo.com" },
      profile: {
        username: "james-okonkwo",
        businessName: "Okonkwo Imagery",
        tagline: "Luxury resort and destination photography",
        bio: "Specializing in luxury resort photography and destination events, I bring a cinematic approach to every shoot. Having worked with properties across the Middle East and North Africa, I understand how to showcase both the location and the people within it. My clients include five-star hotels, travel agencies, and discerning families seeking premium vacation memories.",
        specialties: ["resort", "wedding", "commercial", "event"],
        equipment: ["Canon R3", "Canon RF 15-35mm f/2.8L", "Canon RF 70-200mm f/2.8L", "DJI Mavic 3 Pro"],
        languages: ["English", "Arabic", "French"],
        city: "Dubai",
        country: "United Arab Emirates",
        hourlyRate: 250,
        priceRange: "€250-€500/hour",
        averageRating: 4.8,
        totalReviews: 22,
        completedSessions: 95,
        responseTime: "Same day",
        experience: "5-10 years",
      },
      services: [
        { name: "Destination Wedding", description: "Complete destination wedding coverage with drone footage, second shooter option, and luxury album.", startingAt: 3500, duration: "10 hours" },
        { name: "Resort Photography", description: "Professional photography for hotel marketing, guest experiences, and social media content.", startingAt: 600, duration: "4 hours" },
        { name: "Corporate Event", description: "High-end corporate event coverage with same-day edited highlights.", startingAt: 500, duration: "3 hours" },
      ],
    },
    {
      user: { name: "Sophie Martin", email: "sophie@pixelvo.com" },
      profile: {
        username: "sophie-martin",
        businessName: "Sophie Martin Photo",
        tagline: "Your story, beautifully told",
        bio: "I fell in love with photography while documenting everyday life in the streets of Tunis. Now I combine photojournalistic storytelling with modern portraiture to create images that feel both authentic and polished. Whether it is a family vacation, a surprise proposal, or a simple portrait session, I bring warmth and creativity to every moment.",
        specialties: ["portrait", "family", "event", "resort"],
        equipment: ["Fujifilm X-H2S", "Fujifilm XF 56mm f/1.2", "Fujifilm XF 16-55mm f/2.8", "Godox V1"],
        languages: ["French", "Arabic", "English"],
        city: "Tunis",
        country: "Tunisia",
        hourlyRate: 80,
        priceRange: "€80-€160/hour",
        averageRating: 4.6,
        totalReviews: 18,
        completedSessions: 67,
        responseTime: "Within 2 hours",
        experience: "3-5 years",
      },
      services: [
        { name: "Portrait Session", description: "Creative portrait session in the medina, by the sea, or at a location of your choosing.", startingAt: 80, duration: "1 hour" },
        { name: "Family Vacation Photos", description: "Capture your holiday memories with a professional photographer who knows the best spots in Tunisia.", startingAt: 120, duration: "1.5 hours" },
        { name: "Event Coverage", description: "Birthday parties, anniversaries, and private celebrations documented with style.", startingAt: 300, duration: "3 hours" },
      ],
    },
    {
      user: { name: "Alex Rivera", email: "alex@pixelvo.com" },
      profile: {
        username: "alex-rivera",
        businessName: "Rivera Creative Studio",
        tagline: "Fashion-forward photography with soul",
        bio: "A fashion and commercial photographer turned wedding storyteller. I bring an editorial eye to every love story, creating images that belong in the pages of a magazine. My style is clean, modern, and full of emotion. Working from my studio in Rome or on location across Italy, I specialize in intimate elopements and luxury weddings in iconic settings.",
        specialties: ["wedding", "portrait", "commercial"],
        equipment: ["Sony A1", "Sony 35mm f/1.4 GM", "Sony 135mm f/1.8 GM", "Profoto A2"],
        languages: ["English", "Italian", "Spanish"],
        city: "Rome",
        country: "Italy",
        hourlyRate: 190,
        priceRange: "€190-€380/hour",
        averageRating: 4.8,
        totalReviews: 31,
        completedSessions: 128,
        responseTime: "Within 1 hour",
        experience: "5-10 years",
      },
      services: [
        { name: "Elopement Package", description: "Intimate elopement coverage in Rome, Amalfi Coast, or Tuscany. Includes planning assistance and 200+ edited images.", startingAt: 1800, duration: "6 hours" },
        { name: "Wedding Photography", description: "Full wedding day coverage with a cinematic editorial approach.", startingAt: 2200, duration: "8 hours" },
        { name: "Commercial Portrait", description: "Brand and editorial portraits for professionals and creatives.", startingAt: 200, duration: "1.5 hours" },
        { name: "Couple Session", description: "Romantic couple photography at iconic Italian locations.", startingAt: 250, duration: "1.5 hours" },
      ],
    },
    {
      user: { name: "Nina Petrov", email: "nina@pixelvo.com" },
      profile: {
        username: "nina-petrov",
        businessName: "Nina Petrov Photography",
        tagline: "Documenting the extraordinary in the ordinary",
        bio: "I am a Berlin-based documentary photographer with a deep love for candid storytelling. My approach is unobtrusive — I observe, I wait, I capture. Whether shooting a street wedding, a lively christening, or a quiet family morning at home, my goal is to create a visual diary of real emotions. No posing, no faking, just life as it happens.",
        specialties: ["event", "family", "portrait"],
        equipment: ["Leica Q3", "Leica M11", "Leica Summilux 35mm f/1.4"],
        languages: ["English", "German", "Russian"],
        city: "Berlin",
        country: "Germany",
        hourlyRate: 150,
        priceRange: "€150-€300/hour",
        averageRating: 4.5,
        totalReviews: 15,
        completedSessions: 52,
        responseTime: "Within 2 hours",
        experience: "3-5 years",
      },
      services: [
        { name: "Documentary Family Session", description: "An unscripted session capturing your family's real life: morning routines, playtime, dinner together.", startingAt: 200, duration: "2 hours" },
        { name: "Event Documentation", description: "Candid, unobtrusive coverage of your event or celebration.", startingAt: 350, duration: "3 hours" },
      ],
    },
    {
      user: { name: "Omar Hassan", email: "omar@pixelvo.com" },
      profile: {
        username: "omar-hassan",
        businessName: "Hassan Visual Arts",
        tagline: "Where East meets West through the lens",
        bio: "Drawing inspiration from the crossroads of cultures in Istanbul, I create photography that bridges Eastern and Western aesthetics. My architectural background gives me a unique perspective on framing, light, and space. I work with hotels, travel brands, and couples who want their photos to feel like a cinematic journey through one of the most photogenic cities in the world.",
        specialties: ["resort", "wedding", "commercial", "portrait"],
        equipment: ["Nikon Z9", "Nikon Z 24-70mm f/2.8 S", "Nikon Z 50mm f/1.2 S", "DJI RS 3 Pro"],
        languages: ["English", "Turkish", "Arabic", "German"],
        city: "Istanbul",
        country: "Turkey",
        hourlyRate: 60,
        priceRange: "€60-€150/hour",
        averageRating: 4.2,
        totalReviews: 3,
        completedSessions: 10,
        responseTime: "Same day",
        experience: "1-3 years",
      },
      services: [
        { name: "Istanbul Photo Tour", description: "A walking photography session through Istanbul's most iconic locations — Sultanahmet, Galata, Bosphorus.", startingAt: 100, duration: "2 hours" },
        { name: "Hotel & Resort Photography", description: "Professional interior and lifestyle photography for hospitality brands.", startingAt: 200, duration: "3 hours" },
        { name: "Couple Session", description: "Romantic session with stunning views of the Bosphorus as your backdrop.", startingAt: 80, duration: "1 hour" },
        { name: "Commercial Shoot", description: "Product and lifestyle photography for brands and businesses.", startingAt: 150, duration: "2 hours" },
      ],
    },
  ];

  // ── Review templates ───────────────────────────
  const reviewPool = [
    { customerName: "Emily Watson", title: "Absolutely stunning work!", comment: "We were blown away by the quality of our photos. Every single image was beautiful and perfectly captured the emotion of the day. Could not recommend more highly.", rating: 5 },
    { customerName: "Thomas Mueller", title: "Professional and creative", comment: "From start to finish, the experience was fantastic. The photographer made everyone feel relaxed and comfortable, and the results speak for themselves. Worth every penny.", rating: 5 },
    { customerName: "Aisha Benyahia", title: null, comment: "What a wonderful session! The photographer had great ideas for poses and locations, and managed to capture our kids being their natural, silly selves. We love every photo.", rating: 5 },
    { customerName: "Pierre Lefebvre", title: "Exceeded expectations", comment: "I hired them for our company event and the photos were delivered within 48 hours. The turnaround and quality were both exceptional. Our team loved the candid shots.", rating: 5 },
    { customerName: "Maria Garcia", title: "Perfect for our wedding", comment: "They captured moments we did not even know happened. The cocktail hour photos, the dance floor shots, the quiet moments between us. A true storyteller with a camera.", rating: 5 },
    { customerName: "David Kim", title: null, comment: "Very professional and easy to work with. The photos turned out great and the editing style was exactly what we wanted. Would definitely book again for future events.", rating: 4 },
    { customerName: "Isabella Rossi", title: "Magical family photos", comment: "Our family session was so much fun. The photographer knew exactly how to engage with the children and the final images look like they belong in a magazine. Truly talented.", rating: 5 },
    { customerName: "Ahmed Mansour", title: "Great value", comment: "Excellent photography at a very fair price. The communication was prompt, the session was well-organized, and the delivered photos were beautifully edited. Very satisfied.", rating: 4 },
    { customerName: "Laura Schmidt", title: "Impressive attention to detail", comment: "Every detail was considered, from the lighting to the angles. They scouted our venue beforehand and knew exactly where to position everyone. A true professional.", rating: 5 },
    { customerName: "Chen Wei", title: null, comment: "Nice photos overall. There were a couple of shots that did not quite work, but the majority were excellent. Good experience and friendly photographer.", rating: 4 },
    { customerName: "Fatima Al-Rashid", title: "Best photographer in the region", comment: "We have used many photographers over the years and this was by far the best experience. The creativity, the patience, the quality — everything was top-notch.", rating: 5 },
    { customerName: "Michael Brown", title: "Good but not perfect", comment: "The photographer was pleasant and the session went smoothly. Some photos were amazing but a few felt a bit rushed. Solid work overall, just expected a bit more consistency.", rating: 3 },
    { customerName: "Sophie Bergmann", title: "Dream come true", comment: "From the first consultation to the final gallery delivery, every step was handled with care. The photographer anticipated our needs and delivered beyond what we imagined.", rating: 5 },
    { customerName: "Jack O'Brien", title: null, comment: "Hired them for headshots and was very pleased. Quick turnaround, natural-looking edits, and a great selection to choose from. My LinkedIn never looked better.", rating: 4 },
    { customerName: "Yuki Tanaka", title: "Wonderful experience", comment: "We were visiting and wanted to capture our trip professionally. The photographer showed us hidden gems and made the whole experience feel like an adventure. Beautiful results.", rating: 5 },
    { customerName: "Nadia Kowalski", title: null, comment: "Good photographer with a nice eye for composition. Delivered on time and the quality was consistent throughout the gallery. Would recommend to friends.", rating: 4 },
    { customerName: "Ravi Patel", title: "Outstanding maternity photos", comment: "We felt so comfortable during the session. The photographer was patient, warm, and incredibly skilled. The photos are absolutely beautiful and we will treasure them forever.", rating: 5 },
    { customerName: "Emma Taylor", title: "Perfect resort photos", comment: "Hired them for our resort stay and the photos were incredible. Captured the pool, the beach, and our family having the time of our lives. Worth every cent.", rating: 5 },
  ];

  const responsePool = [
    "Thank you so much for your kind words! It was an absolute pleasure working with you. I hope to see you again soon!",
    "I really appreciate this wonderful review. Your family was a joy to photograph, and I am glad you love the results!",
    "Thank you for trusting me with your special day. It means the world to hear such positive feedback!",
    null,
    "So glad you enjoyed the experience! Looking forward to our next session together.",
    null,
    "Thank you for the lovely review! It was great working with such a fun group.",
    null,
  ];

  // ── Portfolio photo URLs (real Unsplash IDs) ───
  const portfolioPhotoSets: Record<string, { url: string; category: string; caption: string }[]> = {
    "sarah-chen": [
      { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", category: "wedding", caption: "Sunset ceremony at Chateau de Vaux" },
      { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800", category: "wedding", caption: "First dance under the lights" },
      { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800", category: "portrait", caption: "Editorial portrait — Parisian chic" },
      { url: "https://images.unsplash.com/photo-1529635999484-3e3e6e3ff123?w=800", category: "wedding", caption: "Garden bouquet toss" },
      { url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800", category: "portrait", caption: "Natural light studio portrait" },
      { url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800", category: "wedding", caption: "Intimate vows at the lakeside" },
      { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800", category: "event", caption: "Corporate gala evening" },
      { url: "https://images.unsplash.com/photo-1551038247-3d9af20df552?w=800", category: "wedding", caption: "Bridal prep — morning light" },
    ],
    "elena-volkov": [
      { url: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800", category: "family", caption: "Beach day with the Garcias" },
      { url: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800", category: "family", caption: "Autumn park family session" },
      { url: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800", category: "maternity", caption: "Golden hour maternity" },
      { url: "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?w=800", category: "family", caption: "Sunday morning in Barcelona" },
      { url: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800", category: "portrait", caption: "Children portrait — natural expressions" },
    ],
    "alex-rivera": [
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", category: "portrait", caption: "Creative editorial headshot" },
      { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800", category: "wedding", caption: "Amalfi Coast elopement" },
      { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", category: "wedding", caption: "Tuscan vineyard ceremony" },
      { url: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800", category: "commercial", caption: "Brand lifestyle shoot" },
      { url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800", category: "landscape", caption: "Roman Forum at golden hour" },
      { url: "https://images.unsplash.com/photo-1529635999484-3e3e6e3ff123?w=800", category: "wedding", caption: "First look on the Spanish Steps" },
    ],
  };

  const createdUsers: { userId: string; profileId: string; username: string }[] = [];

  for (const p of photographerData) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: p.user.email } });
    if (existing) {
      console.log(`  Skipping existing user: ${p.user.email}`);
      const existingProfile = await prisma.photographerProfile.findUnique({ where: { userId: existing.id } });
      if (existingProfile) {
        createdUsers.push({ userId: existing.id, profileId: existingProfile.id, username: p.profile.username });
      }
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: p.user.name,
        email: p.user.email,
        password: passwordHash,
        role: StaffRole.PHOTOGRAPHER,
        orgId: org.id,
      },
    });

    const profile = await prisma.photographerProfile.create({
      data: {
        userId: user.id,
        username: p.profile.username,
        businessName: p.profile.businessName,
        tagline: p.profile.tagline,
        bio: p.profile.bio,
        specialties: p.profile.specialties,
        equipment: p.profile.equipment,
        languages: p.profile.languages,
        city: p.profile.city,
        country: p.profile.country,
        hourlyRate: p.profile.hourlyRate,
        priceRange: p.profile.priceRange,
        averageRating: p.profile.averageRating,
        totalReviews: p.profile.totalReviews,
        completedSessions: p.profile.completedSessions,
        responseTime: p.profile.responseTime,
        experience: p.profile.experience,
        isPublicProfile: true,
      },
    });

    createdUsers.push({ userId: user.id, profileId: profile.id, username: p.profile.username });
    console.log(`  Created photographer: ${p.user.name} (@${p.profile.username})`);

    // ── Services ──────────────────────────────────
    for (let i = 0; i < p.services.length; i++) {
      await prisma.photographerService.create({
        data: {
          profileId: profile.id,
          name: p.services[i].name,
          description: p.services[i].description,
          startingAt: p.services[i].startingAt,
          duration: p.services[i].duration,
          sortOrder: i,
        },
      });
    }
    console.log(`    -> ${p.services.length} services`);

    // ── Reviews ───────────────────────────────────
    const reviewCount = 3 + Math.floor(Math.random() * 6); // 3-8 reviews
    const shuffledReviews = [...reviewPool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(reviewCount, shuffledReviews.length); i++) {
      const r = shuffledReviews[i];
      const daysAgo = Math.floor(Math.random() * 180) + 7;
      const resp = responsePool[Math.floor(Math.random() * responsePool.length)];
      await prisma.photographerReview.create({
        data: {
          profileId: profile.id,
          photographerId: user.id,
          customerName: r.customerName,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          response: resp,
          respondedAt: resp ? new Date(Date.now() - (daysAgo - 2) * 86400000) : null,
          isVerified: Math.random() < 0.7,
          isPublic: true,
          createdAt: new Date(Date.now() - daysAgo * 86400000),
        },
      });
    }
    console.log(`    -> ${reviewCount} reviews`);

    // ── Availability (next 30 days) ──────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let availCount = 0;
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

      // Random: skip ~15% of days
      if (Math.random() < 0.15) continue;

      // Weekends: 50% chance of being available
      if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() < 0.5) continue;

      await prisma.photographerAvailability.create({
        data: {
          userId: user.id,
          profileId: profile.id,
          date: date,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
          dayOfWeek: dayOfWeek,
        },
      });
      availCount++;
    }
    console.log(`    -> ${availCount} availability days`);

    // ── Portfolio Photos ──────────────────────────
    const photos = portfolioPhotoSets[p.profile.username];
    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        await prisma.portfolioPhoto.create({
          data: {
            profileId: profile.id,
            url: photos[i].url,
            thumbnailUrl: photos[i].url.replace("w=800", "w=400"),
            caption: photos[i].caption,
            category: photos[i].category,
            sortOrder: i,
            isFeatured: i < 3,
          },
        });
      }
      console.log(`    -> ${photos.length} portfolio photos`);
    }
  }

  // ── Sample Marketplace Bookings (completed) ────
  if (createdUsers.length >= 3) {
    const bookingData = [
      {
        idx: 0, // sarah-chen
        customerName: "Robert & Claire Whitfield",
        customerEmail: "whitfield.wedding@gmail.com",
        sessionType: "Wedding Photography",
        sessionDate: new Date(Date.now() - 14 * 86400000), // 2 weeks ago
        sessionStartTime: "10:00",
        sessionDuration: 480,
        sessionLocation: "Chateau de Vaux-le-Vicomte, Paris",
        totalPrice: 2500,
        depositAmount: 750,
        status: MarketplaceBookingStatus.COMPLETED,
        isPaid: true,
      },
      {
        idx: 2, // elena-volkov
        customerName: "The Rodriguez Family",
        customerEmail: "rodriguez.fam@outlook.com",
        sessionType: "Family Session",
        sessionDate: new Date(Date.now() - 7 * 86400000), // 1 week ago
        sessionStartTime: "16:00",
        sessionDuration: 90,
        sessionLocation: "Park Guell, Barcelona",
        totalPrice: 180,
        depositAmount: 50,
        status: MarketplaceBookingStatus.COMPLETED,
        isPaid: true,
      },
      {
        idx: 5, // alex-rivera
        customerName: "Jessica Turner",
        customerEmail: "jess.turner@icloud.com",
        customerPhone: "+44 7700 900123",
        sessionType: "Elopement Package",
        sessionDate: new Date(Date.now() - 21 * 86400000), // 3 weeks ago
        sessionStartTime: "14:00",
        sessionDuration: 360,
        sessionLocation: "Terrazza del Pincio, Rome",
        totalPrice: 1800,
        depositAmount: 600,
        status: MarketplaceBookingStatus.COMPLETED,
        isPaid: true,
      },
    ];

    for (const b of bookingData) {
      const target = createdUsers[b.idx];
      if (!target) continue;
      await prisma.marketplaceBooking.create({
        data: {
          profileId: target.profileId,
          photographerId: target.userId,
          customerName: b.customerName,
          customerEmail: b.customerEmail,
          customerPhone: b.customerPhone ?? null,
          sessionType: b.sessionType,
          sessionDate: b.sessionDate,
          sessionStartTime: b.sessionStartTime,
          sessionDuration: b.sessionDuration,
          sessionLocation: b.sessionLocation,
          totalPrice: b.totalPrice,
          depositAmount: b.depositAmount,
          currency: "EUR",
          status: b.status,
          isPaid: b.isPaid,
          paidAt: b.sessionDate,
        },
      });
      console.log(`  Created booking: ${b.customerName} with @${target.username}`);
    }
  }

  console.log("\n✅ Marketplace seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
