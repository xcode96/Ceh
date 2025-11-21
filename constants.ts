
import type { Module, Exam, QuestionBank } from './types';

// CEH v13 Modules
export const CEH_MODULES: Module[] = [
    {
        id: 1,
        title: "Introduction to Ethical Hacking",
        icon: 'shield',
        color: "bg-gray-100 text-gray-600",
        subTopics: [
            { title: "Information security overview", content: [] },
            { title: "Cyber kill chain", content: [] },
            { title: "MITRE ATT&CK framework", content: [] },
            { title: "Hacker types", content: [] },
            { title: "Attack vectors", content: [] },
            { title: "Penetration testing concepts", content: [] },
            { title: "Vulnerability, threat, and risk", content: [] },
            { title: "Security policies", content: [] },
            { title: "Incident management", content: [] },
            { title: "OWASP", content: [] },
            { title: "CIA triad", content: [] },
            { title: "Defense-in-depth", content: [] }
        ]
    },
    {
        id: 2,
        title: "Footprinting & Reconnaissance",
        icon: 'footprint',
        color: "bg-slate-100 text-slate-600",
        subTopics: [
            { title: "Passive footprinting", content: [] },
            { title: "Active footprinting", content: [] },
            { title: "WHOIS lookup", content: [] },
            { title: "DNS enumeration", content: [] },
            { title: "Email harvesting", content: [] },
            { title: "Website footprinting", content: [] },
            { title: "Social networks reconnaissance", content: [] },
            { title: "Google dorking", content: [] },
            { title: "Shodan OSINT", content: [] },
            { title: "People search", content: [] },
            { title: "Metadata extraction", content: [] },
            { title: "Footprinting through job sites", content: [] },
            { title: "Network footprinting", content: [] },
            { title: "Vulnerability footprinting", content: [] }
        ]
    },
    {
        id: 3,
        title: "Scanning Networks",
        icon: 'scan',
        color: "bg-red-100 text-red-600",
        subTopics: [
            { title: "Host discovery", content: [] },
            { title: "Port scanning", content: [] },
            { title: "Service/version detection", content: [] },
            { title: "Nmap advanced scanning", content: [] },
            { title: "TCP/UDP scanning", content: [] },
            { title: "Idle scan", content: [] },
            { title: "Vulnerability scanning", content: [] },
            { title: "Banner grabbing", content: [] },
            { title: "Firewalking", content: [] },
            { title: "Proxy scanning", content: [] },
            { title: "Network mapping", content: [] },
            { title: "OS detection", content: [] }
        ]
    },
    {
        id: 4,
        title: "Enumeration",
        icon: 'users',
        color: "bg-orange-100 text-orange-600",
        subTopics: [
            { title: "NetBIOS enumeration", content: [] },
            { title: "SNMP enumeration", content: [] },
            { title: "LDAP enumeration", content: [] },
            { title: "NFS, RPC enumeration", content: [] },
            { title: "DNS zone transfers", content: [] },
            { title: "SMB enumeration", content: [] },
            { title: "SMTP user enumeration", content: [] },
            { title: "FTP enumeration", content: [] },
            { title: "Active Directory enumeration", content: [] },
            { title: "Vulnerability identification using enumeration", content: [] }
        ]
    },
    {
        id: 5,
        title: "Vulnerability Analysis",
        icon: 'bug',
        color: "bg-amber-100 text-amber-600",
        subTopics: [
            { title: "Vulnerability lifecycle", content: [] },
            { title: "Vulnerability scoring (CVSS)", content: [] },
            { title: "SIEM & scanning tools", content: [] },
            { title: "Automating scans", content: [] },
            { title: "Network vulnerability scanning", content: [] },
            { title: "Application vulnerability scanning", content: [] },
            { title: "Database vulnerability scanning", content: [] },
            { title: "Host-based vulnerability assessment", content: [] },
            { title: "Patch management", content: [] }
        ]
    },
    {
        id: 6,
        title: "System Hacking",
        icon: 'laptop',
        color: "bg-yellow-100 text-yellow-600",
        subTopics: [
            { title: "Password cracking", content: [] },
            { title: "Privilege escalation (Windows & Linux)", content: [] },
            { title: "Malware service manipulation", content: [] },
            { title: "UAC bypass", content: [] },
            { title: "Executing applications remotely", content: [] },
            { title: "Hiding files & folders", content: [] },
            { title: "Clearing logs", content: [] },
            { title: "Covering tracks", content: [] },
            { title: "Persistence techniques", content: [] },
            { title: "Credential dumping (LSA, SAM)", content: [] },
            { title: "Mimikatz", content: [] }
        ]
    },
    {
        id: 7,
        title: "Malware Threats",
        icon: 'alert',
        color: "bg-lime-100 text-lime-600",
        subTopics: [
            { title: "Trojan analysis", content: [] },
            { title: "Backdoor analysis", content: [] },
            { title: "Virus types", content: [] },
            { title: "Worms", content: [] },
            { title: "Botnet architecture", content: [] },
            { title: "Keyloggers", content: [] },
            { title: "Ransomware basics", content: [] },
            { title: "Malware lifecycle", content: [] },
            { title: "AMSI bypass basics", content: [] },
            { title: "Malware obfuscation", content: [] },
            { title: "Malware detection tools", content: [] }
        ]
    },
    {
        id: 8,
        title: "Sniffing",
        icon: 'wifi',
        color: "bg-green-100 text-green-600",
        subTopics: [
            { title: "Packet sniffing basics", content: [] },
            { title: "Wireshark analysis", content: [] },
            { title: "MAC flooding", content: [] },
            { title: "DHCP starvation", content: [] },
            { title: "ARP poisoning", content: [] },
            { title: "MITM attacks", content: [] },
            { title: "DNS spoofing", content: [] },
            { title: "SSL strip", content: [] },
            { title: "Sniffing in switched networks", content: [] },
            { title: "Sniffing countermeasures", content: [] }
        ]
    },
    {
        id: 9,
        title: "Social Engineering",
        icon: 'users',
        color: "bg-emerald-100 text-emerald-600",
        subTopics: [
            { title: "Human-based attacks", content: [] },
            { title: "Phishing, smishing, vishing", content: [] },
            { title: "Impersonation attacks", content: [] },
            { title: "Baiting & quid pro quo", content: [] },
            { title: "Social engineering frameworks", content: [] },
            { title: "Honeypots for social engineering prevention", content: [] },
            { title: "Insider attacks", content: [] },
            { title: "Awareness training", content: [] }
        ]
    },
    {
        id: 10,
        title: "Denial of Service",
        icon: 'ban',
        color: "bg-teal-100 text-teal-600",
        subTopics: [
            { title: "DoS techniques", content: [] },
            { title: "DDoS botnets", content: [] },
            { title: "Application layer DDoS", content: [] },
            { title: "SYN flood attacks", content: [] },
            { title: "UDP flood attacks", content: [] },
            { title: "HTTP flood", content: [] },
            { title: "Slowloris attack", content: [] },
            { title: "Botnets architecture", content: [] },
            { title: "DoS detection", content: [] },
            { title: "Mitigation (CDNs, WAFs)", content: [] }
        ]
    },
    {
        id: 11,
        title: "Session Hijacking",
        icon: 'lock',
        color: "bg-cyan-100 text-cyan-600",
        subTopics: [
            { title: "Session hijacking basics", content: [] },
            { title: "Session prediction", content: [] },
            { title: "TCP hijacking", content: [] },
            { title: "UDP hijacking", content: [] },
            { title: "Application-level hijacking", content: [] },
            { title: "Cookie stealing", content: [] },
            { title: "Cross-site request forgery token bypass", content: [] },
            { title: "Session sniffing", content: [] },
            { title: "Countermeasures", content: [] }
        ]
    },
    {
        id: 12,
        title: "Evading IDS, Firewalls & Honeypots",
        icon: 'shield-check',
        color: "bg-sky-100 text-sky-600",
        subTopics: [
            { title: "IDS detection techniques", content: [] },
            { title: "Firewall rules bypassing", content: [] },
            { title: "Honeypot detection & evasion", content: [] },
            { title: "Traffic fragmentation", content: [] },
            { title: "Stealth scanning", content: [] },
            { title: "Packet crafting tools", content: [] },
            { title: "Polymorphic shellcode", content: [] },
            { title: "Tunneling techniques (DNS, ICMP, HTTP)", content: [] },
            { title: "Proxy evasion", content: [] }
        ]
    },
    {
        id: 13,
        title: "Hacking Web Servers",
        icon: 'server',
        color: "bg-blue-100 text-blue-600",
        subTopics: [
            { title: "Web server fingerprinting", content: [] },
            { title: "IIS & Apache vulnerabilities", content: [] },
            { title: "Misconfiguration attacks", content: [] },
            { title: "Directory traversal", content: [] },
            { title: "Web server malware", content: [] },
            { title: "SSH brute-force", content: [] },
            { title: "Uploading shells", content: [] },
            { title: "Web server hardening", content: [] }
        ]
    },
    {
        id: 14,
        title: "Hacking Web Applications",
        icon: 'code-bracket',
        color: "bg-indigo-100 text-indigo-600",
        subTopics: [
            { title: "OWASP Top 10", content: [] },
            { title: "SQL Injection", content: [] },
            { title: "XSS (reflected, stored, DOM)", content: [] },
            { title: "CSRF attacks", content: [] },
            { title: "Command injection", content: [] },
            { title: "File inclusion", content: [] },
            { title: "Broken authentication", content: [] },
            { title: "API hacking", content: [] },
            { title: "Web app reconnaissance", content: [] },
            { title: "Cookie manipulation", content: [] },
            { title: "Web shell exploitation", content: [] }
        ]
    },
    {
        id: 15,
        title: "SQL Injection",
        icon: 'database',
        color: "bg-violet-100 text-violet-600",
        subTopics: [
            { title: "SQLi basics", content: [] },
            { title: "UNION-based SQLi", content: [] },
            { title: "Error-based SQLi", content: [] },
            { title: "Boolean/blind SQLi", content: [] },
            { title: "Time-based SQLi", content: [] },
            { title: "Out-of-band SQLi", content: [] },
            { title: "Bypassing WAF", content: [] },
            { title: "Extracting database data", content: [] },
            { title: "Targeting MySQL, MSSQL, Oracle, PostgreSQL", content: [] }
        ]
    },
    {
        id: 16,
        title: "Hacking Wireless Networks",
        icon: 'wifi',
        color: "bg-purple-100 text-purple-600",
        subTopics: [
            { title: "Wi-Fi basics", content: [] },
            { title: "WEP/WPA/WPA2 cracking", content: [] },
            { title: "Evil twin attacks", content: [] },
            { title: "Rogue AP", content: [] },
            { title: "Deauthentication attack", content: [] },
            { title: "Wi-Fi phishing", content: [] },
            { title: "Bluetooth hacking", content: [] },
            { title: "NFC attacks", content: [] },
            { title: "Wireless security hardening", content: [] }
        ]
    },
    {
        id: 17,
        title: "Hacking Mobile Platforms",
        icon: 'smartphone',
        color: "bg-fuchsia-100 text-fuchsia-600",
        subTopics: [
            { title: "Android architecture", content: [] },
            { title: "iOS architecture", content: [] },
            { title: "Mobile malware", content: [] },
            { title: "Mobile app pentesting", content: [] },
            { title: "Rooting & jailbreak basics", content: [] },
            { title: "Mobile device management", content: [] },
            { title: "Mobile OS vulnerabilities", content: [] },
            { title: "App reverse engineering", content: [] }
        ]
    },
    {
        id: 18,
        title: "IoT & OT Hacking",
        icon: 'iot',
        color: "bg-pink-100 text-pink-600",
        subTopics: [
            { title: "IoT device architecture", content: [] },
            { title: "IoT attack surface", content: [] },
            { title: "Smart home hacking", content: [] },
            { title: "Embedded device exploitation", content: [] },
            { title: "SCADA/ICS basics", content: [] },
            { title: "Modbus attacks", content: [] },
            { title: "RTU & PLC attacks", content: [] },
            { title: "IoT malware (Mirai, others)", content: [] },
            { title: "IoT security controls", content: [] }
        ]
    },
    {
        id: 19,
        title: "Cloud Computing",
        icon: 'cloud',
        color: "bg-rose-100 text-rose-600",
        subTopics: [
            { title: "Cloud security basics", content: [] },
            { title: "Shared responsibility model", content: [] },
            { title: "IAM in cloud", content: [] },
            { title: "Cloud attacks", content: [] },
            { title: "Serverless exploitation", content: [] },
            { title: "Container security", content: [] },
            { title: "Cloud network security", content: [] },
            { title: "Cloud enum (AWS/Azure/GCP)", content: [] },
            { title: "Cloud hardening techniques", content: [] }
        ]
    },
    {
        id: 20,
        title: "Cryptography",
        icon: 'key',
        color: "bg-gray-200 text-gray-700",
        subTopics: [
            { title: "Encryption types", content: [] },
            { title: "Hashing algorithms", content: [] },
            { title: "Digital signatures", content: [] },
            { title: "SSL/TLS", content: [] },
            { title: "Steganography", content: [] },
            { title: "Kerberos", content: [] },
            { title: "Disk encryption", content: [] },
            { title: "Email encryption", content: [] },
            { title: "Cryptanalysis techniques", content: [] }
        ]
    }
];

// CISSP Modules
export const CISSP_MODULES: Module[] = [
    {
        id: 21,
        title: "Security and Risk Management",
        icon: 'shield',
        color: "bg-purple-100 text-purple-600",
        subTopics: [
            { title: "Professional Ethics", content: [] },
            { title: "Security Concepts (CIA)", content: [] },
            { title: "Security Governance", content: [] },
            { title: "Compliance", content: [] },
            { title: "Legal and Regulatory Issues", content: [] },
            { title: "Risk Management Concepts", content: [] },
            { title: "Threat Modeling", content: [] },
            { title: "Business Continuity Planning", content: [] }
        ]
    },
    {
        id: 22,
        title: "Asset Security",
        icon: 'database',
        color: "bg-blue-100 text-blue-600",
        subTopics: [
            { title: "Information Classification", content: [] },
            { title: "Data Lifecycle", content: [] },
            { title: "Data Retention", content: [] },
            { title: "Data Security Controls", content: [] },
            { title: "Asset Handling Requirements", content: [] }
        ]
    },
    {
        id: 23,
        title: "Security Architecture and Engineering",
        icon: 'server',
        color: "bg-green-100 text-green-600",
        subTopics: [
            { title: "Security Models", content: [] },
            { title: "System Evaluation Models", content: [] },
            { title: "Vulnerability Mitigation", content: [] },
            { title: "Cryptography", content: [] },
            { title: "Site and Facility Security", content: [] }
        ]
    },
    {
        id: 24,
        title: "Communication and Network Security",
        icon: 'wifi',
        color: "bg-orange-100 text-orange-600",
        subTopics: [
            { title: "Network Architecture", content: [] },
            { title: "Network Components", content: [] },
            { title: "Secure Communication Channels", content: [] },
            { title: "Network Attacks", content: [] }
        ]
    },
    {
        id: 25,
        title: "Identity and Access Management (IAM)",
        icon: 'users',
        color: "bg-red-100 text-red-600",
        subTopics: [
            { title: "Physical and Logical Access", content: [] },
            { title: "Identification and Authentication", content: [] },
            { title: "Identity as a Service (IDaaS)", content: [] },
            { title: "Authorization Mechanisms", content: [] },
            { title: "Access Control Attacks", content: [] }
        ]
    },
    {
        id: 26,
        title: "Security Assessment and Testing",
        icon: 'scan',
        color: "bg-yellow-100 text-yellow-600",
        subTopics: [
            { title: "Assessment and Testing Strategies", content: [] },
            { title: "Security Process Data", content: [] },
            { title: "Security Audits", content: [] },
            { title: "Vulnerability Assessment", content: [] },
            { title: "Penetration Testing", content: [] }
        ]
    },
    {
        id: 27,
        title: "Security Operations",
        icon: 'alert',
        color: "bg-teal-100 text-teal-600",
        subTopics: [
            { title: "Investigations", content: [] },
            { title: "Logging and Monitoring", content: [] },
            { title: "Configuration Management", content: [] },
            { title: "Incident Management", content: [] },
            { title: "Disaster Recovery", content: [] },
            { title: "Physical Security", content: [] }
        ]
    },
    {
        id: 28,
        title: "Software Development Security",
        icon: 'code-bracket',
        color: "bg-indigo-100 text-indigo-600",
        subTopics: [
            { title: "SDLC Security", content: [] },
            { title: "Environment Security", content: [] },
            { title: "Software Security Effectiveness", content: [] },
            { title: "Secure Coding Guidelines", content: [] }
        ]
    }
];

export const INITIAL_EXAM_DATA: Exam[] = [
    {
        id: 1,
        title: "CEH v13",
        description: "Certified Ethical Hacker. Master the tools and techniques used by hackers to assess and secure computer systems.",
        modules: CEH_MODULES
    },
    {
        id: 2,
        title: "CISSP",
        description: "Certified Information Systems Security Professional. The gold standard for information security professionals.",
        modules: CISSP_MODULES
    }
];

export const INITIAL_QUESTION_BANK: QuestionBank = {};
