from django.core.management.base import BaseCommand
from store.models import Category, Jersey, Order, OrderItem

class Command(BaseCommand):
    help = 'Seeds Kit Culture with initial categories and iconic football jerseys'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Kit Culture categories and jerseys...')

        categories_data = [
            {
                'name': 'Club Kits',
                'slug': 'club-kits',
                'description': 'Current season authentic kits from the world’s elite European football clubs.',
                'image_url': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop'
            },
            {
                'name': 'National Teams',
                'slug': 'national-teams',
                'description': 'World Cup and continental tournament shirts worn by global national powerhouses.',
                'image_url': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop'
            },
            {
                'name': 'Retro Classics',
                'slug': 'retro-classics',
                'description': 'Nostalgic iconic jerseys commemorating unforgettable seasons and legendary icons.',
                'image_url': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop'
            },
            {
                'name': 'Special Editions',
                'slug': 'special-editions',
                'description': 'Exclusive collaborations, blackout editions, and cultural street-style kit releases.',
                'image_url': 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop'
            }
        ]

        categories = {}
        for c_data in categories_data:
            cat, created = Category.objects.update_or_create(
                slug=c_data['slug'],
                defaults=c_data
            )
            categories[c_data['slug']] = cat

        jerseys_data = [
            {
                'name': 'Real Madrid 2024/25 Home Authentic Kit',
                'slug': 'real-madrid-2024-25-home-authentic',
                'category': categories['club-kits'],
                'club_or_country': 'Real Madrid',
                'season': '2024/25',
                'kit_type': 'Home',
                'caption': 'The Regal White of 15 European Crowns. Elegance forged in Santiago Bernabéu glory.',
                'description': 'Engineered with bespoke hounds-tooth texture subtly woven into the iconic pristine white. Features moisture-wicking HEAT.RDY technology, gold accent trims, and the official 15-time Champions League sleeve badge.',
                'price': 2999.00,
                'original_price': 3999.00,
                'image_url': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
                'badge': 'BESTSELLER',
                'available_sizes': 'S,M,L,XL,XXL',
                'stock': 45,
                'rating': 4.9,
                'review_count': 164,
                'is_featured': True,
                'customization_available': True
            },
            {
                'name': 'Argentina 2022 World Cup Three-Star Gold Edition',
                'slug': 'argentina-2022-world-cup-three-star',
                'category': categories['national-teams'],
                'club_or_country': 'Argentina',
                'season': '2022/23',
                'kit_type': 'Special Edition',
                'caption': 'Immortalized in Doha. The Holy Grail of Three Stars worn by Lionel Messi.',
                'description': 'The historical Albiceleste jersey featuring the golden third star embroidered above the AFA crest and the coveted gold FIFA World Champions 2022 chest badge. High-breathability weave with iconic sky-blue vertical stripes.',
                'price': 3299.00,
                'original_price': 4299.00,
                'image_url': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
                'badge': 'LEGENDARY',
                'available_sizes': 'S,M,L,XL',
                'stock': 28,
                'rating': 5.0,
                'review_count': 230,
                'is_featured': True,
                'customization_available': True
            },
            {
                'name': 'Arsenal 2003/04 "Invincibles" Retro O2 Kit',
                'slug': 'arsenal-2003-04-invincibles-retro',
                'category': categories['retro-classics'],
                'club_or_country': 'Arsenal',
                'season': '2003/04',
                'kit_type': 'Retro',
                'caption': 'Pure Nostalgia. 49 Games Undefeated in Highbury Crimson and Gold.',
                'description': 'Relive Thierry Henry, Dennis Bergkamp, and Patrick Vieira with this faithful retro reproduction. Features the classic felt O2 sponsor, embroidered historic cannon shield crest, and comfortable vintage cotton-poly blend.',
                'price': 2799.00,
                'original_price': 3499.00,
                'image_url': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
                'badge': 'RETRO ICON',
                'available_sizes': 'S,M,L,XL,XXL',
                'stock': 35,
                'rating': 4.9,
                'review_count': 98,
                'is_featured': True,
                'customization_available': True
            },
            {
                'name': 'Japan Special Edition "Origami Dragon" Kit',
                'slug': 'japan-special-edition-origami-dragon',
                'category': categories['special-editions'],
                'club_or_country': 'Japan',
                'season': '2024',
                'kit_type': 'Special Edition',
                'caption': 'Where Eastern Artistry Meets Football Avant-Garde.',
                'description': 'A masterpiece of football apparel design, fusing geometric Japanese origami crow motifs with hyper-modern streetwear sensibilities. Deep indigo base punctuated by iridescent cyan and fiery rose detailing.',
                'price': 3199.00,
                'original_price': 3899.00,
                'image_url': 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
                'badge': 'COLLECTOR ITEM',
                'available_sizes': 'S,M,L,XL',
                'stock': 19,
                'rating': 4.9,
                'review_count': 112,
                'is_featured': True,
                'customization_available': True
            },
            {
                'name': 'Brazil 1970 World Cup Pelé Commemorative Kit',
                'slug': 'brazil-1970-world-cup-pele-retro',
                'category': categories['retro-classics'],
                'club_or_country': 'Brazil',
                'season': '1970',
                'kit_type': 'Retro',
                'caption': 'Canarinho Gold. The most beautiful team to ever grace planet Earth.',
                'description': 'Pure timeless yellow jersey with classic emerald green collar and ribbed cuffs. Celebrating the glorious Joga Bonito played under the Mexican sun, led by the King Pelé, Jairzinho, and Carlos Alberto.',
                'price': 2699.00,
                'original_price': 3299.00,
                'image_url': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
                'badge': 'TIMELESS CLASSIC',
                'available_sizes': 'M,L,XL,XXL',
                'stock': 22,
                'rating': 4.8,
                'review_count': 87,
                'is_featured': True,
                'customization_available': True
            },
            {
                'name': 'Manchester City 2024/25 "0161" Home Kit',
                'slug': 'manchester-city-2024-25-home-kit',
                'category': categories['club-kits'],
                'club_or_country': 'Manchester City',
                'season': '2024/25',
                'kit_type': 'Home',
                'caption': 'Sky Blue Dominance. Rooted in Manchester telephone code 0161 culture.',
                'description': 'Incorporating the 0161 dialing code graffiti onto the collar and sleeve cuffs, embodying the cultural pulse of Manchester. Ultra-lightweight ULTRAWEAVE fabric with silicone gold Champions crest.',
                'price': 2899.00,
                'original_price': 3699.00,
                'image_url': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
                'badge': 'PREMIER CHAMPIONS',
                'available_sizes': 'S,M,L,XL',
                'stock': 32,
                'rating': 4.7,
                'review_count': 74,
                'is_featured': False,
                'customization_available': True
            },
            {
                'name': 'AC Milan 2006/07 Athens UCL Revenge Retro Kit',
                'slug': 'ac-milan-2006-07-athens-retro',
                'category': categories['retro-classics'],
                'club_or_country': 'AC Milan',
                'season': '2006/07',
                'kit_type': 'Retro',
                'caption': 'Rossoneri Majesty. Inzaghi, Kaká, and Maldini lifting Big Ears in Athens.',
                'description': 'Iconic all-white "Lucky Jersey" worn by AC Milan in the 2007 UEFA Champions League final. Features the Opel/Bwin sponsor and golden embroidered match commemorative details.',
                'price': 2899.00,
                'original_price': 3599.00,
                'image_url': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
                'badge': 'EUROPEAN ROYALTY',
                'available_sizes': 'S,M,L,XL,XXL',
                'stock': 15,
                'rating': 4.9,
                'review_count': 91,
                'is_featured': False,
                'customization_available': True
            },
            {
                'name': 'Inter Miami 2024 "La Noche" Pink Edition',
                'slug': 'inter-miami-2024-la-noche-pink',
                'category': categories['special-editions'],
                'club_or_country': 'Inter Miami',
                'season': '2024',
                'kit_type': 'Special Edition',
                'caption': 'The Global Sensation. South Beach pastel vibrancy with Messi magic.',
                'description': 'Vibrant flamingo pink accented by black polo collar and dual-heron crest. High-aeration performance mesh tailored for humid summer nights and maximum flair.',
                'price': 2999.00,
                'original_price': 3799.00,
                'image_url': 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
                'back_image_url': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
                'badge': 'TRENDING',
                'available_sizes': 'S,M,L,XL',
                'stock': 40,
                'rating': 4.8,
                'review_count': 142,
                'is_featured': True,
                'customization_available': True
            }
        ]

        for j_data in jerseys_data:
            Jersey.objects.update_or_create(
                slug=j_data['slug'],
                defaults=j_data
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded categories and 8 premium jerseys!'))
