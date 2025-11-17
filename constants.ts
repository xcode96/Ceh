import type { Module, Exam } from './types';

const CEH_MODULES: Module[] = [
    {
        id: 1,
        title: "Introduction to Ethical Hacking",
        icon: 'shield',
        color: "bg-gray-100 text-gray-600",
        subTopics: ["Information security overview", "Cyber kill chain", "MITRE ATT&CK framework", "Hacker types", "Attack vectors", "Penetration testing concepts", "Vulnerability, threat, and risk", "Security policies", "Incident management", "OWASP", "CIA triad", "Defense-in-depth"]
    },
    {
        id: 2,
        title: "Footprinting & Reconnaissance",
        icon: 'footprint',
        color: "bg-slate-100 text-slate-600",
        subTopics: ["Passive footprinting", "Active footprinting", "WHOIS lookup", "DNS enumeration", "Email harvesting", "Website footprinting", "Social networks reconnaissance", "Google dorking", "Shodan OSINT", "People search", "Metadata extraction", "Footprinting through job sites", "Network footprinting", "Vulnerability footprinting"]
    },
    {
        id: 3,
        title: "Scanning Networks",
        icon: 'scan',
        color: "bg-red-100 text-red-600",
        subTopics: ["Host discovery", "Port scanning", "Service/version detection", "Nmap advanced scanning", "TCP/UDP scanning", "Idle scan", "Vulnerability scanning", "Banner grabbing", "Firewalking", "Proxy scanning", "Network mapping", "OS detection"]
    },
    {
        id: 4,
        title: "Enumeration",
        icon: 'users',
        color: "bg-orange-100 text-orange-600",
        subTopics: ["NetBIOS enumeration", "SNMP enumeration", "LDAP enumeration", "NFS, RPC enumeration", "DNS zone transfers", "SMB enumeration", "SMTP user enumeration", "FTP enumeration", "Active Directory enumeration", "Vulnerability identification using enumeration"]
    },
    {
        id: 5,
        title: "Vulnerability Analysis",
        icon: 'bug',
        color: "bg-amber-100 text-amber-600",
        subTopics: ["Vulnerability lifecycle", "Vulnerability scoring (CVSS)", "SIEM & scanning tools", "Automating scans", "Network vulnerability scanning", "Application vulnerability scanning", "Database vulnerability scanning", "Host-based vulnerability assessment", "Patch management"]
    },
    {
        id: 6,
        title: "System Hacking",
        icon: 'laptop',
        color: "bg-yellow-100 text-yellow-600",
        subTopics: ["Password cracking", "Privilege escalation (Windows & Linux)", "Malware service manipulation", "UAC bypass", "Executing applications remotely", "Hiding files & folders", "Clearing logs", "Covering tracks", "Persistence techniques", "Credential dumping (LSA, SAM)", "Mimikatz"]
    },
    {
        id: 7,
        title: "Malware Threats",
        icon: 'alert',
        color: "bg-lime-100 text-lime-600",
        subTopics: ["Trojan analysis", "Backdoor analysis", "Virus types", "Worms", "Botnet architecture", "Keyloggers", "Ransomware basics", "Malware lifecycle", "AMSI bypass basics", "Malware obfuscation", "Malware detection tools"]
    },
    {
        id: 8,
        title: "Sniffing",
        icon: 'wifi',
        color: "bg-green-100 text-green-600",
        subTopics: ["Packet sniffing basics", "Wireshark analysis", "MAC flooding", "DHCP starvation", "ARP poisoning", "MITM attacks", "DNS spoofing", "SSL strip", "Sniffing in switched networks", "Sniffing countermeasures"]
    },
    {
        id: 9,
        title: "Social Engineering",
        icon: 'users',
        color: "bg-emerald-100 text-emerald-600",
        subTopics: ["Human-based attacks", "Phishing, smishing, vishing", "Impersonation attacks", "Baiting & quid pro quo", "Social engineering frameworks", "Honeypots for social engineering prevention", "Insider attacks", "Awareness training"]
    },
    {
        id: 10,
        title: "Denial of Service",
        icon: 'ban',
        color: "bg-teal-100 text-teal-600",
        subTopics: ["DoS techniques", "DDoS botnets", "Application layer DDoS", "SYN flood attacks", "UDP flood attacks", "HTTP flood", "Slowloris attack", "Botnets architecture", "DoS detection", "Mitigation (CDNs, WAFs)"]
    },
    {
        id: 11,
        title: "Session Hijacking",
        icon: 'key',
        color: "bg-cyan-100 text-cyan-600",
        subTopics: ["Session hijacking basics", "Session prediction", "TCP hijacking", "UDP hijacking", "Application-level hijacking", "Cookie stealing", "Cross-site request forgery token bypass", "Session sniffing", "Countermeasures"]
    },
    {
        id: 12,
        title: "Evading IDS, Firewalls & Honeypots",
        icon: 'shield-check',
        color: "bg-sky-100 text-sky-600",
        subTopics: ["IDS detection techniques", "Firewall rules bypassing", "Honeypot detection & evasion", "Traffic fragmentation", "Stealth scanning", "Packet crafting tools", "Polymorphic shellcode", "Tunneling techniques (DNS, ICMP, HTTP)", "Proxy evasion"]
    },
    {
        id: 13,
        title: "Hacking Web Servers",
        icon: 'server',
        color: "bg-blue-100 text-blue-600",
        subTopics: ["Web server fingerprinting", "IIS & Apache vulnerabilities", "Misconfiguration attacks", "Directory traversal", "Web server malware", "SSH brute-force", "Uploading shells", "Web server hardening"]
    },
    {
        id: 14,
        title: "Hacking Web Applications",
        icon: 'code-bracket',
        color: "bg-indigo-100 text-indigo-600",
        subTopics: ["OWASP Top 10", "SQL Injection", "XSS (reflected, stored, DOM)", "CSRF attacks", "Command injection", "File inclusion", "Broken authentication", "API hacking", "Web app reconnaissance", "Cookie manipulation", "Web shell exploitation"]
    },
    {
        id: 15,
        title: "SQL Injection",
        icon: 'database',
        color: "bg-violet-100 text-violet-600",
        subTopics: ["SQLi basics", "UNION-based SQLi", "Error-based SQLi", "Boolean/blind SQLi", "Time-based SQLi", "Out-of-band SQLi", "Bypassing WAF", "Extracting database data", "Targeting MySQL, MSSQL, Oracle, PostgreSQL"]
    },
    {
        id: 16,
        title: "Hacking Wireless Networks",
        icon: 'wifi',
        color: "bg-purple-100 text-purple-600",
        subTopics: ["Wi-Fi basics", "WEP/WPA/WPA2 cracking", "Evil twin attacks", "Rogue AP", "Deauthentication attack", "Wi-Fi phishing", "Bluetooth hacking", "NFC attacks", "Wireless security hardening"]
    },
    {
        id: 17,
        title: "Hacking Mobile Platforms",
        icon: 'smartphone',
        color: "bg-fuchsia-100 text-fuchsia-600",
        subTopics: ["Android architecture", "iOS architecture", "Mobile malware", "Mobile app pentesting", "Rooting & jailbreak basics", "Mobile device management", "Mobile OS vulnerabilities", "App reverse engineering"]
    },
    {
        id: 18,
        title: "IoT & OT Hacking",
        icon: 'iot',
        color: "bg-pink-100 text-pink-600",
        subTopics: ["IoT device architecture", "IoT attack surface", "Smart home hacking", "Embedded device exploitation", "SCADA/ICS basics", "Modbus attacks", "RTU & PLC attacks", "IoT malware (Mirai, others)", "IoT security controls"]
    },
    {
        id: 19,
        title: "Cloud Computing",
        icon: 'cloud',
        color: "bg-rose-100 text-rose-600",
        subTopics: ["Cloud security basics", "Shared responsibility model", "IAM in cloud", "Cloud attacks", "Serverless exploitation", "Container security", "Cloud network security", "Cloud enum (AWS/Azure/GCP)", "Cloud hardening techniques"]
    },
    {
        id: 20,
        title: "Cryptography",
        icon: 'lock',
        color: "bg-stone-100 text-stone-600",
        subTopics: ["Encryption types", "Hashing algorithms", "Digital signatures", "SSL/TLS", "Steganography", "Kerberos", "Disk encryption", "Email encryption", "Cryptanalysis techniques"]
    }
];

const CISSP_MODULES: Module[] = [
    {
        id: 21,
        title: "Security & Risk Management",
        icon: 'shield',
        color: "bg-gray-100 text-gray-600",
        subTopics: ["CIA Triad", "Due care / Due diligence", "Security governance", "Security roles & responsibilities", "Threat modeling", "Information security management", "Policies, standards, procedures, guidelines", "Security frameworks (ISO 27001, NIST CSF, NIST 800-53)", "Governance vs Management", "Control types (Administrative/Technical/Physical)", "Control functions (Preventive, Detective, Corrective)", "Legal systems: Civil, Common, Religious, Customary", "Cyber laws", "Privacy laws (GDPR, HIPAA, CCPA)", "Intellectual Property laws", "Computer Crime laws", "Contracting & procurement", "Licensing agreements", "Risk identification", "Risk analysis", "Risk treatment", "Risk registers", "Threat modeling (STRIDE, DREAD, PASTA)", "Business Impact Analysis (BIA)", "MTD, RTO, RPO, WRT", "Continuity planning", "Alternate sites", "DR strategy", "Backup types", "Recovery phasing", "DR Plan testing", "Background checks", "Onboarding security", "Employee agreements (NDA, AUP)", "Separation of duties (SoD)", "Job rotation", "Termination process", "Training levels", "Social engineering prevention", "Role-based security education"]
    },
    {
        id: 22,
        title: "Asset Security",
        icon: 'database',
        color: "bg-slate-100 text-slate-600",
        subTopics: ["Data Classification", "Data Ownership Roles", "Privacy Protection", "Data Lifecycle", "Secure Data Storage", "Secure Data Destruction", "Media Security"]
    },
    {
        id: 23,
        title: "Security Architecture & Engineering",
        icon: 'server',
        color: "bg-red-100 text-red-600",
        subTopics: ["Secure Design Principles", "Security Models", "Security Architecture Frameworks", "Cryptography", "Physical Security", "Secure Hardware", "Embedded Systems", "Virtualization & Cloud"]
    },
    {
        id: 24,
        title: "Communication & Network Security",
        icon: 'wifi',
        color: "bg-orange-100 text-orange-600",
        subTopics: ["Network Architecture", "Secure Communication Channels", "Network Devices", "Wireless Networks", "Attack & Defense", "VoIP, VPN, Mobile Networks"]
    },
    {
        id: 25,
        title: "Identity & Access Management",
        icon: 'key',
        color: "bg-amber-100 text-amber-600",
        subTopics: ["Identification & Authentication", "Access Control Models", "Identity Federation", "Identity Lifecycle", "Access Attacks"]
    },
    {
        id: 26,
        title: "Security Assessment & Testing",
        icon: 'scan',
        color: "bg-yellow-100 text-yellow-600",
        subTopics: ["Assessment Types", "Testing Techniques", "Security Controls Testing", "Log Review & Security Monitoring", "Reporting"]
    },
    {
        id: 27,
        title: "Security Operations",
        icon: 'shield-check',
        color: "bg-lime-100 text-lime-600",
        subTopics: ["Incident Response", "Digital Forensics", "Change & Configuration Management", "Patch Management", "Logging & Monitoring", "Physical & Environmental Operations", "Recovery Strategies"]
    },
    {
        id: 28,
        title: "Software Development Security",
        icon: 'code-bracket',
        color: "bg-green-100 text-green-600",
        subTopics: ["Software Development Models", "Threat Modeling", "Secure Coding", "Software Security Testing", "Databases & Big Data", "CI/CD Pipeline"]
    }
];

export const INITIAL_EXAM_DATA: Exam[] = [
    {
        id: 1,
        title: "CEH v13",
        description: "Certified Ethical Hacker v13 training modules covering everything from footprinting to cryptography.",
        modules: CEH_MODULES
    },
    {
        id: 2,
        title: "CISSP",
        description: "Certified Information Systems Security Professional modules covering security and risk management, asset security, and more.",
        modules: CISSP_MODULES
    }
];