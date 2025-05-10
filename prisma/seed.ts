import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting seed...');

        // Clear existing industries
        console.log('Clearing existing industries...');
        await prisma.industry.deleteMany();
        console.log('Existing industries cleared.');

        // Create main industries
        console.log('Creating industries...');
        const industries = [
            {
                name: 'Agriculture & Agribusiness',
                code: 'AGR',
                description: 'Crop production, livestock farming, agricultural machinery, agrochemicals, food processing',
                children: [
                    {
                        name: 'Crop Production',
                        code: 'AGR-CRP',
                        description: 'Commercial and sustainable crop cultivation, harvest management, post-harvest processing, and agricultural yield optimization'
                    },
                    {
                        name: 'Livestock Farming',
                        code: 'AGR-LST',
                        description: 'Animal husbandry, livestock management, breeding programs, and sustainable farming practices'
                    },
                    {
                        name: 'Agricultural Machinery',
                        code: 'AGR-MCH',
                        description: 'Manufacturing and distribution of farming equipment, irrigation systems, and agricultural automation solutions'
                    },
                    {
                        name: 'Agrochemicals',
                        code: 'AGR-CHM',
                        description: 'Production and distribution of fertilizers, pesticides, and other agricultural chemical products'
                    },
                    {
                        name: 'Food Processing',
                        code: 'AGR-FOD',
                        description: 'Processing, packaging, and preservation of agricultural products for commercial distribution'
                    }
                ]
            },
            {
                name: 'Automotive',
                code: 'AUT',
                description: 'Vehicle manufacturing, auto parts production, car sales and dealerships, automotive services',
                children: [
                    {
                        name: 'Vehicle Manufacturing',
                        code: 'AUT-MFG',
                        description: 'Design, engineering, and production of passenger vehicles, commercial vehicles, and automotive components'
                    },
                    {
                        name: 'Auto Parts Production',
                        code: 'AUT-PRT',
                        description: 'Manufacturing of automotive components, spare parts, and aftermarket products'
                    },
                    {
                        name: 'Car Sales and Dealerships',
                        code: 'AUT-SLS',
                        description: 'Retail and wholesale distribution of new and used vehicles, dealership management, and automotive sales services'
                    },
                    {
                        name: 'Automotive Services',
                        code: 'AUT-SVC',
                        description: 'Vehicle maintenance, repair services, diagnostic testing, and automotive technical support'
                    }
                ]
            },
            {
                name: 'Aerospace & Defense',
                code: 'AER',
                description: 'Aircraft manufacturing, space exploration, military defense systems, aerospace engineering',
                children: [
                    {
                        name: 'Aircraft Manufacturing',
                        code: 'AER-ACT',
                        description: 'Design, development, and production of commercial and military aircraft, including components and systems'
                    },
                    {
                        name: 'Space Exploration',
                        code: 'AER-SPC',
                        description: 'Spacecraft development, satellite systems, space mission operations, and space technology research'
                    },
                    {
                        name: 'Military Defense Systems',
                        code: 'AER-DEF',
                        description: 'Development and production of defense systems, military aircraft, and defense technology solutions'
                    },
                    {
                        name: 'Aerospace Engineering',
                        code: 'AER-ENG',
                        description: 'Aerospace system design, structural engineering, propulsion systems, and aerospace technology development'
                    }
                ]
            },
            {
                name: 'Energy & Utilities',
                code: 'ENG',
                description: 'Oil and gas, renewable energy, nuclear energy, electricity and water utilities',
                children: [
                    {
                        name: 'Oil and Gas',
                        code: 'ENG-OIL',
                        description: 'Exploration, extraction, refining, and distribution of petroleum products and natural gas resources'
                    },
                    {
                        name: 'Renewable Energy',
                        code: 'ENG-REN',
                        description: 'Solar, wind, hydroelectric, and other renewable energy generation and distribution systems'
                    },
                    {
                        name: 'Nuclear Energy',
                        code: 'ENG-NUC',
                        description: 'Nuclear power generation, nuclear fuel processing, and nuclear energy management systems'
                    },
                    {
                        name: 'Electricity and Water Utilities',
                        code: 'ENG-UTL',
                        description: 'Power generation, transmission, distribution, and water resource management services'
                    }
                ]
            },
            {
                name: 'Construction & Real Estate',
                code: 'CON',
                description: 'Commercial and residential construction, real estate development, property management',
                children: [
                    {
                        name: 'Commercial Construction',
                        code: 'CON-COM',
                        description: 'Design and construction of office buildings, retail spaces, industrial facilities, and commercial infrastructure'
                    },
                    {
                        name: 'Residential Construction',
                        code: 'CON-RES',
                        description: 'Development and construction of housing projects, residential buildings, and community infrastructure'
                    },
                    {
                        name: 'Real Estate Development',
                        code: 'CON-DEV',
                        description: 'Property development, land acquisition, project planning, and real estate investment management'
                    },
                    {
                        name: 'Property Management',
                        code: 'CON-PMG',
                        description: 'Property maintenance, tenant management, facility operations, and real estate asset management'
                    }
                ]
            },
            {
                name: 'Financial Services',
                code: 'FIN',
                description: 'Banking, investment services, insurance, wealth management, credit services',
                children: [
                    {
                        name: 'Banking',
                        code: 'FIN-BNK',
                        description: 'Retail and commercial banking services, financial transactions, and banking technology solutions'
                    },
                    {
                        name: 'Investment Services',
                        code: 'FIN-INV',
                        description: 'Investment management, portfolio services, financial advisory, and investment technology platforms'
                    },
                    {
                        name: 'Wealth Management',
                        code: 'FIN-WLT',
                        description: 'Private banking, financial planning, estate management, and high-net-worth client services'
                    },
                    {
                        name: 'Credit Services',
                        code: 'FIN-CRD',
                        description: 'Credit card services, lending solutions, credit risk management, and financial technology platforms'
                    }
                ]
            },
            {
                name: 'Healthcare & Pharmaceuticals',
                code: 'HTH',
                description: 'Hospitals and healthcare facilities, pharmaceutical companies, biotechnology',
                children: [
                    {
                        name: 'Hospitals and Healthcare Facilities',
                        code: 'HTH-HSP',
                        description: 'Medical centers, specialized clinics, healthcare delivery systems, and patient care services'
                    },
                    {
                        name: 'Pharmaceutical Companies',
                        code: 'HTH-PHR',
                        description: 'Drug development, pharmaceutical manufacturing, clinical research, and healthcare product distribution'
                    },
                    {
                        name: 'Medical Equipment Manufacturing',
                        code: 'HTH-EQP',
                        description: 'Production of medical devices, diagnostic equipment, and healthcare technology solutions'
                    }
                ]
            },
            {
                name: 'Information Technology',
                code: 'ITC',
                description: 'Software development, hardware manufacturing, IT consulting and services',
                children: [
                    {
                        name: 'Software Development',
                        code: 'ITC-SFT',
                        description: 'Custom software development, application programming, system integration, and software solutions'
                    },
                    {
                        name: 'Hardware Manufacturing',
                        code: 'ITC-HRD',
                        description: 'Computer hardware production, server manufacturing, networking equipment, and IT infrastructure'
                    },
                    {
                        name: 'IT Consulting and Services',
                        code: 'ITC-CNS',
                        description: 'IT strategy consulting, system implementation, technical support, and managed IT services'
                    },
                    {
                        name: 'Cloud Computing',
                        code: 'ITC-CLD',
                        description: 'Cloud infrastructure, platform services, software as a service (SaaS), and cloud solutions'
                    }
                ]
            },
            {
                name: 'Digital Technology & Innovation',
                code: 'DIG',
                description: 'Emerging technologies, digital transformation, and innovation services',
                children: [
                    {
                        name: 'Artificial Intelligence & Machine Learning',
                        code: 'DIG-AI',
                        description: 'Development and implementation of AI systems, machine learning models, neural networks, and deep learning solutions for business and consumer applications'
                    },
                    {
                        name: 'Blockchain & Web3',
                        code: 'DIG-BLK',
                        description: 'Blockchain technology development, cryptocurrency solutions, smart contracts, decentralized applications, and Web3 infrastructure'
                    },
                    {
                        name: 'Cybersecurity',
                        code: 'DIG-SEC',
                        description: 'Security solutions, threat detection systems, vulnerability assessment, compliance management, and digital protection services'
                    },
                    {
                        name: 'Data Science & Analytics',
                        code: 'DIG-DAT',
                        description: 'Big data analytics, business intelligence solutions, predictive modeling, data visualization, and advanced analytics services'
                    },
                    {
                        name: 'Digital Transformation',
                        code: 'DIG-TRF',
                        description: 'Digital strategy consulting, process automation, business model innovation, and digital modernization services'
                    },
                    {
                        name: 'Edge Computing',
                        code: 'DIG-EDG',
                        description: 'Edge device solutions, distributed computing systems, real-time processing platforms, and IoT infrastructure development'
                    },
                    {
                        name: 'Extended Reality (AR/VR/MR)',
                        code: 'DIG-XR',
                        description: 'Augmented reality, virtual reality, and mixed reality solutions for enterprise, education, entertainment, and training applications'
                    },
                    {
                        name: 'Internet of Things (IoT)',
                        code: 'DIG-IOT',
                        description: 'Connected device solutions, sensor networks, IoT platforms, smart systems, and industrial IoT applications'
                    },
                    {
                        name: 'Quantum Computing',
                        code: 'DIG-QNT',
                        description: 'Quantum algorithm development, quantum hardware solutions, quantum software platforms, and quantum computing services'
                    },
                    {
                        name: 'Robotics & Automation',
                        code: 'DIG-ROB',
                        description: 'Industrial robotics solutions, service robots, automation systems, robotic process automation, and smart manufacturing technologies'
                    }
                ]
            },
            {
                name: 'Technology & Electronics',
                code: 'TEC',
                description: 'Consumer electronics, semiconductor manufacturing, hardware innovation',
                children: [
                    {
                        name: 'Consumer Electronics',
                        code: 'TEC-CON',
                        description: 'Consumer device manufacturing, electronics retail, and consumer technology solutions'
                    },
                    {
                        name: 'Semiconductor Manufacturing',
                        code: 'TEC-SEM',
                        description: 'Chip production, semiconductor design, and microelectronics manufacturing'
                    },
                    {
                        name: 'Embedded Systems',
                        code: 'TEC-EMB',
                        description: 'Embedded software development, microcontroller systems, and integrated solutions'
                    },
                    {
                        name: 'Hardware Innovation',
                        code: 'TEC-INV',
                        description: 'Next-generation hardware development, prototype manufacturing, and technology innovation'
                    },
                    {
                        name: 'Smart Devices',
                        code: 'TEC-SMT',
                        description: 'Connected device manufacturing, smart technology solutions, and IoT product development'
                    }
                ]
            },
            {
                name: 'Retail',
                code: 'RET',
                description: 'Online retail, brick-and-mortar retail, wholesale distribution',
                children: [
                    {
                        name: 'Online Retail',
                        code: 'RET-ONL',
                        description: 'E-commerce platforms, online marketplaces, digital retail solutions, and online shopping services'
                    },
                    {
                        name: 'Brick-and-Mortar Retail',
                        code: 'RET-BRK',
                        description: 'Physical retail stores, shopping centers, retail operations, and in-store customer experience'
                    },
                    {
                        name: 'Wholesale Distribution',
                        code: 'RET-WHS',
                        description: 'Bulk product distribution, supply chain management, and wholesale trade operations'
                    }
                ]
            },
            {
                name: 'Hospitality & Tourism',
                code: 'HOS',
                description: 'Hotels and resorts, travel agencies, airlines, event planning',
                children: [
                    {
                        name: 'Hotels and Resorts',
                        code: 'HOS-HTL',
                        description: 'Luxury accommodations, resort management, hospitality services, and guest experience solutions'
                    },
                    {
                        name: 'Travel Agencies',
                        code: 'HOS-TRV',
                        description: 'Travel planning, tour operations, travel technology platforms, and tourism services'
                    },
                    {
                        name: 'Airlines',
                        code: 'HOS-AIR',
                        description: 'Air transportation services, airline operations, aviation management, and travel solutions'
                    },
                    {
                        name: 'Event Planning',
                        code: 'HOS-EVT',
                        description: 'Event management, conference planning, venue coordination, and special event services'
                    }
                ]
            },
            {
                name: 'Education',
                code: 'EDU',
                description: 'Schools and universities, e-learning platforms, educational services',
                children: [
                    {
                        name: 'Schools and Universities',
                        code: 'EDU-SCH',
                        description: 'Primary, secondary, and higher education institutions, academic programs, and educational facilities'
                    },
                    {
                        name: 'E-learning Platforms',
                        code: 'EDU-ELE',
                        description: 'Online education platforms, digital learning solutions, and educational technology services'
                    },
                    {
                        name: 'Educational Services',
                        code: 'EDU-SVC',
                        description: 'Educational consulting, curriculum development, student services, and educational support'
                    },
                    {
                        name: 'Vocational Training',
                        code: 'EDU-VOC',
                        description: 'Professional training programs, skill development, certification courses, and career education'
                    }
                ]
            },
            {
                name: 'Media & Entertainment',
                code: 'MED',
                description: 'Film and television, music industry, publishing, broadcasting',
                children: [
                    {
                        name: 'Film and Television',
                        code: 'MED-FTV',
                        description: 'Content production, broadcasting, streaming services, and entertainment media distribution'
                    },
                    {
                        name: 'Music Industry',
                        code: 'MED-MUS',
                        description: 'Music production, recording, distribution, and digital music platform services'
                    },
                    {
                        name: 'Publishing',
                        code: 'MED-PUB',
                        description: 'Book publishing, digital content creation, media distribution, and publishing services'
                    },
                    {
                        name: 'Broadcasting',
                        code: 'MED-BRD',
                        description: 'Television and radio broadcasting, content delivery, and media transmission services'
                    },
                    {
                        name: 'Gaming and Esports',
                        code: 'MED-GAM',
                        description: 'Video game development, esports competitions, gaming platforms, and interactive entertainment'
                    }
                ]
            },
            {
                name: 'Telecommunications',
                code: 'TEL',
                description: 'Mobile services, internet providers, satellite and cable TV',
                children: [
                    {
                        name: 'Mobile Services',
                        code: 'TEL-MOB',
                        description: 'Mobile network operations, wireless communications, and mobile technology solutions'
                    },
                    {
                        name: 'Internet Providers',
                        code: 'TEL-INT',
                        description: 'Internet service provision, broadband solutions, and network infrastructure services'
                    },
                    {
                        name: 'Satellite and Cable TV',
                        code: 'TEL-SAT',
                        description: 'Satellite communications, cable television services, and broadcast distribution systems'
                    },
                    {
                        name: 'Networking Services',
                        code: 'TEL-NET',
                        description: 'Network infrastructure, communication systems, and telecommunications technology solutions'
                    }
                ]
            },
            {
                name: 'Transportation & Logistics',
                code: 'TRN',
                description: 'Shipping and freight, public transportation, aviation, supply chain',
                children: [
                    {
                        name: 'Shipping and Freight',
                        code: 'TRN-SHP',
                        description: 'Cargo transportation, freight forwarding, logistics management, and shipping services'
                    },
                    {
                        name: 'Public Transportation',
                        code: 'TRN-PUB',
                        description: 'Mass transit systems, public transport operations, and transportation infrastructure management'
                    },
                    {
                        name: 'Aviation',
                        code: 'TRN-AVI',
                        description: 'Air transportation services, airport operations, and aviation management solutions'
                    },
                    {
                        name: 'Supply Chain Management',
                        code: 'TRN-SCM',
                        description: 'Supply chain optimization, logistics planning, and distribution network management'
                    },
                    {
                        name: 'Warehousing and Distribution',
                        code: 'TRN-WRH',
                        description: 'Storage facilities, distribution centers, and inventory management solutions'
                    }
                ]
            },
            {
                name: 'Chemicals',
                code: 'CHM',
                description: 'Basic chemicals, specialty chemicals, petrochemicals, industrial chemicals',
                children: [
                    {
                        name: 'Basic Chemicals',
                        code: 'CHM-BAS',
                        description: 'Production of fundamental chemical compounds, industrial chemicals, and chemical manufacturing'
                    },
                    {
                        name: 'Specialty Chemicals',
                        code: 'CHM-SPC',
                        description: 'Custom chemical formulations, specialized chemical products, and chemical innovation'
                    },
                    {
                        name: 'Petrochemicals',
                        code: 'CHM-PET',
                        description: 'Petroleum-based chemical production, refining processes, and petrochemical products'
                    },
                    {
                        name: 'Industrial Chemicals',
                        code: 'CHM-IND',
                        description: 'Manufacturing of industrial chemical products, process chemicals, and chemical solutions'
                    },
                    {
                        name: 'Consumer Products',
                        code: 'CHM-CON',
                        description: 'Household chemical products, consumer chemical formulations, and retail chemical solutions'
                    }
                ]
            },
            {
                name: 'Manufacturing',
                code: 'MFG',
                description: 'Electronics manufacturing, machinery and equipment, textile and apparel',
                children: [
                    {
                        name: 'Electronics Manufacturing',
                        code: 'MFG-ELE',
                        description: 'Electronic component production, device manufacturing, and electronics assembly'
                    },
                    {
                        name: 'Machinery and Equipment',
                        code: 'MFG-MCH',
                        description: 'Industrial machinery production, equipment manufacturing, and manufacturing systems'
                    },
                    {
                        name: 'Textile and Apparel',
                        code: 'MFG-TXT',
                        description: 'Fabric production, clothing manufacturing, and textile product development'
                    },
                    {
                        name: 'Food and Beverage Manufacturing',
                        code: 'MFG-FOD',
                        description: 'Food processing, beverage production, and consumable goods manufacturing'
                    },
                    {
                        name: 'Metal and Metal Products',
                        code: 'MFG-MET',
                        description: 'Metal fabrication, metal product manufacturing, and metal processing solutions'
                    }
                ]
            },
            {
                name: 'Environmental Services',
                code: 'ENV',
                description: 'Waste management, recycling services, environmental consultancy',
                children: [
                    {
                        name: 'Waste Management',
                        code: 'ENV-WST',
                        description: 'Waste collection, disposal services, and waste management solutions'
                    },
                    {
                        name: 'Recycling Services',
                        code: 'ENV-REC',
                        description: 'Material recycling, waste processing, and sustainable resource management'
                    },
                    {
                        name: 'Environmental Consultancy',
                        code: 'ENV-CNS',
                        description: 'Environmental assessment, sustainability consulting, and environmental management services'
                    },
                    {
                        name: 'Water and Air Quality Management',
                        code: 'ENV-QAL',
                        description: 'Water treatment, air quality control, and environmental monitoring solutions'
                    },
                    {
                        name: 'Renewable Energy Solutions',
                        code: 'ENV-REN',
                        description: 'Clean energy implementation, sustainable power solutions, and renewable technology'
                    }
                ]
            },
            {
                name: 'Legal Services',
                code: 'LEG',
                description: 'Law firms, legal consultancies, corporate law, litigation',
                children: [
                    {
                        name: 'Law Firms',
                        code: 'LEG-FRM',
                        description: 'Legal practice, attorney services, and law firm management'
                    },
                    {
                        name: 'Legal Consultancies',
                        code: 'LEG-CNS',
                        description: 'Legal advisory services, compliance consulting, and legal strategy development'
                    },
                    {
                        name: 'Corporate Law',
                        code: 'LEG-COR',
                        description: 'Business law services, corporate governance, and corporate legal solutions'
                    },
                    {
                        name: 'Litigation',
                        code: 'LEG-LIT',
                        description: 'Legal dispute resolution, court representation, and litigation services'
                    },
                    {
                        name: 'Intellectual Property Services',
                        code: 'LEG-IPR',
                        description: 'IP protection, patent services, trademark management, and intellectual property law'
                    }
                ]
            },
            {
                name: 'Non-profit & Social Services',
                code: 'NPO',
                description: 'Charitable organizations, community development, foundations',
                children: [
                    {
                        name: 'Charitable Organizations',
                        code: 'NPO-CHA',
                        description: 'Non-profit organizations, charitable foundations, and philanthropic services'
                    },
                    {
                        name: 'Community Development',
                        code: 'NPO-COM',
                        description: 'Community programs, social development initiatives, and local improvement projects'
                    },
                    {
                        name: 'Foundations and Trusts',
                        code: 'NPO-FND',
                        description: 'Grant-making organizations, charitable trusts, and foundation management'
                    },
                    {
                        name: 'Social Work and Human Services',
                        code: 'NPO-SOC',
                        description: 'Social services, human welfare programs, and community support services'
                    },
                    {
                        name: 'NGOs',
                        code: 'NPO-NGO',
                        description: 'Non-governmental organizations, international aid, and humanitarian services'
                    }
                ]
            },
            {
                name: 'Marketing & Advertising',
                code: 'MKT',
                description: 'Digital marketing, branding and PR, advertising agencies',
                children: [
                    {
                        name: 'Digital Marketing',
                        code: 'MKT-DIG',
                        description: 'Online marketing strategies, digital campaign management, and digital advertising solutions'
                    },
                    {
                        name: 'Branding and PR',
                        code: 'MKT-BRD',
                        description: 'Brand development, public relations, and corporate communications services'
                    },
                    {
                        name: 'Advertising Agencies',
                        code: 'MKT-ADV',
                        description: 'Creative advertising, campaign development, and marketing communication services'
                    },
                    {
                        name: 'Market Research',
                        code: 'MKT-RES',
                        description: 'Consumer research, market analysis, and business intelligence services'
                    },
                    {
                        name: 'Event Marketing',
                        code: 'MKT-EVT',
                        description: 'Event promotion, experiential marketing, and brand activation services'
                    }
                ]
            },
            {
                name: 'Mining & Metals',
                code: 'MIN',
                description: 'Mining of natural resources, metal production, resource exploration',
                children: [
                    {
                        name: 'Mining of Natural Resources',
                        code: 'MIN-NAT',
                        description: 'Mineral extraction, resource mining operations, and mining technology solutions'
                    },
                    {
                        name: 'Metal Production',
                        code: 'MIN-MET',
                        description: 'Metal processing, alloy production, and metal manufacturing services'
                    },
                    {
                        name: 'Resource Exploration',
                        code: 'MIN-EXP',
                        description: 'Mineral exploration, resource assessment, and geological surveying services'
                    },
                    {
                        name: 'Mineral Processing',
                        code: 'MIN-PRC',
                        description: 'Ore processing, mineral refinement, and raw material processing solutions'
                    }
                ]
            },
            {
                name: 'Textiles & Apparel',
                code: 'TXT',
                description: 'Textile manufacturing, fashion industry, garment production',
                children: [
                    {
                        name: 'Textile Manufacturing',
                        code: 'TXT-MFG',
                        description: 'Fabric production, textile processing, and material manufacturing services'
                    },
                    {
                        name: 'Fashion Industry',
                        code: 'TXT-FSH',
                        description: 'Fashion design, clothing production, and fashion retail services'
                    },
                    {
                        name: 'Garment Production',
                        code: 'TXT-GRM',
                        description: 'Clothing manufacturing, apparel production, and garment assembly services'
                    },
                    {
                        name: 'Footwear Manufacturing',
                        code: 'TXT-FTW',
                        description: 'Shoe production, footwear design, and shoe manufacturing services'
                    }
                ]
            },
            {
                name: 'Food & Beverage',
                code: 'FOD',
                description: 'Food production and packaging, restaurants and catering',
                children: [
                    {
                        name: 'Food Production and Packaging',
                        code: 'FOD-PRD',
                        description: 'Food manufacturing, packaging solutions, and food processing services'
                    },
                    {
                        name: 'Restaurants and Catering',
                        code: 'FOD-RST',
                        description: 'Food service operations, restaurant management, and catering services'
                    },
                    {
                        name: 'Beverage Manufacturing',
                        code: 'FOD-BEV',
                        description: 'Beverage production, drink manufacturing, and beverage distribution'
                    },
                    {
                        name: 'Fast Food Chains',
                        code: 'FOD-FST',
                        description: 'Quick service restaurants, fast food operations, and food service management'
                    },
                    {
                        name: 'Grocery Retailing',
                        code: 'FOD-GRC',
                        description: 'Food retail operations, grocery store management, and food distribution'
                    }
                ]
            },
            {
                name: 'Public Sector / Government',
                code: 'GOV',
                description: 'Local, state, and national government services, public administration',
                children: [
                    {
                        name: 'Local Government Services',
                        code: 'GOV-LOC',
                        description: 'Municipal services, local administration, and community government operations'
                    },
                    {
                        name: 'State Government Services',
                        code: 'GOV-STT',
                        description: 'State administration, regional governance, and state-level public services'
                    },
                    {
                        name: 'National Government Services',
                        code: 'GOV-NAT',
                        description: 'Federal administration, national governance, and government operations'
                    },
                    {
                        name: 'Public Administration',
                        code: 'GOV-ADM',
                        description: 'Government management, public policy implementation, and administrative services'
                    },
                    {
                        name: 'Regulatory Agencies',
                        code: 'GOV-REG',
                        description: 'Regulatory oversight, compliance monitoring, and policy enforcement services'
                    }
                ]
            },
            {
                name: 'Professional Services',
                code: 'PRF',
                description: 'Consulting, accounting and auditing, legal services, HR',
                children: [
                    {
                        name: 'Consulting',
                        code: 'PRF-CNS',
                        description: 'Business consulting, management advisory, and professional consulting services'
                    },
                    {
                        name: 'Accounting and Auditing',
                        code: 'PRF-ACC',
                        description: 'Financial accounting, audit services, and financial advisory solutions'
                    },
                    {
                        name: 'Human Resources and Staffing',
                        code: 'PRF-HR',
                        description: 'HR management, recruitment services, and workforce solutions'
                    },
                    {
                        name: 'Architecture and Engineering',
                        code: 'PRF-ENG',
                        description: 'Architectural design, engineering services, and construction consulting'
                    }
                ]
            },
            {
                name: 'Biotechnology',
                code: 'BIO',
                description: 'Genetic research, bio-pharmaceuticals, medical diagnostics',
                children: [
                    {
                        name: 'Genetic Research',
                        code: 'BIO-GEN',
                        description: 'Genetic engineering, DNA research, and genetic technology development'
                    },
                    {
                        name: 'Bio-pharmaceuticals',
                        code: 'BIO-PHR',
                        description: 'Biological drug development, biopharmaceutical manufacturing, and medical research'
                    },
                    {
                        name: 'Medical Diagnostics',
                        code: 'BIO-DIA',
                        description: 'Diagnostic technology, medical testing, and healthcare diagnostics solutions'
                    },
                    {
                        name: 'Agricultural Biotechnology',
                        code: 'BIO-AGR',
                        description: 'Agricultural biotech solutions, crop improvement, and bio-agricultural products'
                    }
                ]
            },
            {
                name: 'Insurance',
                code: 'INS',
                description: 'Life insurance, health insurance, property and casualty insurance',
                children: [
                    {
                        name: 'Life Insurance',
                        code: 'INS-LIF',
                        description: 'Life coverage, policy management, and life insurance solutions'
                    },
                    {
                        name: 'Health Insurance',
                        code: 'INS-HLT',
                        description: 'Healthcare coverage, medical insurance, and health benefit solutions'
                    },
                    {
                        name: 'Property and Casualty Insurance',
                        code: 'INS-PRP',
                        description: 'Property coverage, casualty insurance, and risk management solutions'
                    },
                    {
                        name: 'Reinsurance',
                        code: 'INS-REI',
                        description: 'Risk transfer, reinsurance solutions, and insurance risk management'
                    },
                    {
                        name: 'Insurance Brokerage',
                        code: 'INS-BRK',
                        description: 'Insurance brokerage services, policy placement, and insurance consulting'
                    }
                ]
            }
        ];

        // Create industries with their children
        for (const industry of industries) {
            const { children, ...parentData } = industry;

            // Create parent industry
            console.log(`Creating parent industry: ${parentData.name}`);
            const parent = await prisma.industry.create({
                data: parentData
            });

            // Create child industries
            if (children) {
                console.log(`Creating children for ${parentData.name}...`);
                for (const child of children) {
                    await prisma.industry.create({
                        data: {
                            ...child,
                            parentId: parent.id
                        }
                    });
                }
            }
        }

        console.log('Seed completed successfully');
    } catch (error) {
        console.error('Error during seed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    });
