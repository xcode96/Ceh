
import type { Module, Exam, SubTopic } from './types';

const CEH_MODULES: Module[] = [
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
        icon: 'key',
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
        icon: 'lock',
        color: "bg-stone-100 text-stone-600",
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

const CISSP_MODULES: Module[] = [
    {
        id: 21,
        title: "DOMAIN 1: Security & Risk Management",
        icon: 'shield',
        color: "bg-gray-100 text-gray-600",
        subTopics: [
          { title: "1.1 Security Fundamentals", content: ["CIA Triad", "Due care / Due diligence", "Security governance", "Security roles & responsibilities", "Threat modeling", "Information security management"] },
          { title: "1.2 Security Governance Principles", content: ["Policies, standards, procedures, guidelines", "Security frameworks (ISO 27001, NIST CSF, NIST 800-53)", "Governance vs Management", "Control types (Administrative/Technical/Physical)", "Control functions (Preventive, Detective, Corrective)"] },
          { title: "1.3 Compliance", content: ["Legal systems: Civil, Common, Religious, Customary", "Cyber laws:", "Privacy laws (GDPR, HIPAA, CCPA)", "Intellectual Property laws", "Computer Crime laws", "Contracting & procurement", "Licensing agreements:", "Open-source", "Proprietary", "Creative Commons"] },
          { title: "1.4 Risk Management", content: ["Risk identification", "Risk analysis:", "Qualitative", "Quantitative (ALE, SLE, ARO)", "Risk treatment:", "Accept", "Avoid", "Transfer", "Mitigate", "Risk registers", "Threat modeling (STRIDE, DREAD, PASTA)"] },
          { title: "1.5 Business Continuity (BC)", content: ["Business Impact Analysis (BIA)", "MTD, RTO, RPO, WRT", "Continuity planning", "Alternate sites:", "Hot", "Warm", "Cold", "Mobile site"] },
          { title: "1.6 Disaster Recovery (DR)", content: ["DR strategy", "Backup types:", "Full / Differential / Incremental", "Recovery phasing", "DR Plan testing:", "Checklist", "Simulation", "Parallel test"] },
          { title: "1.7 Personnel Security", content: ["Background checks", "Onboarding security", "Employee agreements (NDA, AUP)", "Separation of duties (SoD)", "Job rotation", "Termination process"] },
          { title: "1.8 Security Awareness & Training", content: ["Training levels:", "Awareness", "Training", "Education", "Social engineering prevention", "Role-based security education"] }
        ]
    },
    {
        id: 22,
        title: "DOMAIN 2: Asset Security",
        icon: 'database',
        color: "bg-slate-100 text-slate-600",
        subTopics: [
            { title: "2.1 Data Classification", content: ["Public / Internal / Confidential / Secret", "Regulatory data types", "Sensitivity levels", "Data labeling & handling"] },
            { title: "2.2 Data Ownership Roles", content: ["Data Owner", "Data Steward/Custodian", "Data Processor", "Data Controller", "Users"] },
            { title: "2.3 Privacy Protection", content: ["PII, PHI, PCI", "Data minimization", "Consent management", "Data governance programs"] },
            { title: "2.4 Data Lifecycle", content: ["Create", "Store", "Use", "Share/Transmit", "Archive", "Dispose/Destroy"] },
            { title: "2.5 Secure Data Storage", content: ["Encryption at rest", "Tokenization", "Data masking", "Secure containers"] },
            { title: "2.6 Secure Data Destruction", content: ["Wiping", "Degaussing", "Shredding", "Incineration", "Cryptographic erasure"] },
            { title: "2.7 Media Security", content: ["Media marking", "Media sanitization", "Media transportation SOPs"] }
        ]
    },
    {
        id: 23,
        title: "DOMAIN 3: Security Architecture & Engineering",
        icon: 'server',
        color: "bg-red-100 text-red-600",
        subTopics: [
            { title: "3.1 Secure Design Principles", content: ["Least privilege", "Fail-safe defaults", "Economy of mechanism", "Complete mediation", "Defense-in-depth"] },
            { title: "3.2 Security Models", content: ["Bell-LaPadula (Confidentiality)", "Biba (Integrity)", "Clark-Wilson model", "Brewer-Nash", "Information flow model"] },
            { title: "3.3 Security Architecture Frameworks", content: ["SABSA", "TOGAF", "Zachman", "OSA"] },
            { title: "3.4 Cryptography", content: ["Symmetric algorithms (AES, DES, 3DES)", "Asymmetric algorithms (RSA, ECC)", "Hashing (SHA-256, SHA-3)", "Digital signatures", "Key management lifecycle", "Public Key Infrastructure (PKI)", "Certificate lifecycle"] },
            { title: "3.5 Physical Security", content: ["Site design", "Fencing, lighting, access control", "Mantraps, turnstiles", "Fire suppression systems", "HVAC controls", "CCTV and guards"] },
            { title: "3.6 Secure Hardware", content: ["TPM (Trusted Platform Module)", "HSM (Hardware Security Module)", "Secure boot", "Side-channel attack prevention"] },
            { title: "3.7 Embedded Systems", content: ["IoT device security", "SCADA/ICS security", "Firmware protection"] },
            { title: "3.8 Virtualization & Cloud", content: ["Hypervisor security (Type 1, Type 2)", "Containerization", "Cloud service models (IaaS, PaaS, SaaS)", "Multi-tenancy security"] }
        ]
    },
    {
        id: 24,
        title: "DOMAIN 4: Communication & Network Security",
        icon: 'wifi',
        color: "bg-orange-100 text-orange-600",
        subTopics: [
            { title: "4.1 Network Architecture", content: ["OSI & TCP/IP models", "Network segmentation", "VLANs", "Subnetting"] },
            { title: "4.2 Secure Communication Channels", content: ["TLS/SSL", "IPSec", "SSH"] },
            { title: "4.3 Network Devices", content: ["Router security", "Switch security", "NGFW (Next-Gen Firewalls)", "IDS/IPS", "Network Access Control (NAC)"] },
            { title: "4.4 Wireless Networks", content: ["Wi-Fi standards", "WPA3 security", "EAP authentication"] },
            { title: "4.5 Attack & Defense", content: ["DNS Poisoning", "ARP Spoofing", "DoS/DDoS", "Session hijacking", "Zero Trust Network Architecture"] },
            { title: "4.6 VoIP, VPN, Mobile Networks", content: ["SIP security", "PPTP/L2TP/IPSec", "4G/5G threats"] }
        ]
    },
    {
        id: 25,
        title: "DOMAIN 5: Identity & Access Management",
        icon: 'key',
        color: "bg-amber-100 text-amber-600",
        subTopics: [
            { title: "5.1 Identification & Authentication", content: ["Factors of authentication", "Biometrics", "MFA"] },
            { title: "5.2 Access Control Models", content: ["DAC / MAC / RBAC / ABAC", "Mandatory vs Discretionary", "Privileged Access Management (PAM)"] },
            { title: "5.3 Identity Federation", content: ["SSO", "OAuth", "OpenID Connect", "SAML"] },
            { title: "5.4 Identity Lifecycle", content: ["Provisioning", "Deprovisioning", "Access certification", "Credential rotation"] },
            { title: "5.5 Access Attacks", content: ["Credential stuffing", "Password spraying", "Session hijacking"] }
        ]
    },
    {
        id: 26,
        title: "DOMAIN 6: Security Assessment & Testing",
        icon: 'scan',
        color: "bg-yellow-100 text-yellow-600",
        subTopics: [
            { title: "6.1 Assessment Types", content: ["Vulnerability scanning", "Penetration testing", "Audits (internal/external)"] },
            { title: "6.2 Testing Techniques", content: ["Static testing (SAST)", "Dynamic testing (DAST)", "Interactive testing (IAST)", "Fuzzing", "Regression testing"] },
            { title: "6.3 Security Controls Testing", content: ["Technical controls testing", "Administrative controls review", "Physical controls testing"] },
            { title: "6.4 Log Review & Security Monitoring", content: ["SIEM", "Syslog analysis"] },
            { title: "6.5 Reporting", content: ["Findings", "Recommendations", "Metrics & dashboards"] }
        ]
    },
    {
        id: 27,
        title: "DOMAIN 7: Security Operations",
        icon: 'shield-check',
        color: "bg-lime-100 text-lime-600",
        subTopics: [
            { title: "7.1 Incident Response", content: ["Identification", "Containment", "Eradication", "Recovery", "Lessons Learned"] },
            { title: "7.2 Digital Forensics", content: ["Chain of custody", "Evidence acquisition", "Disk forensics", "Memory forensics"] },
            { title: "7.3 Change & Configuration Management", content: ["Version control", "Configuration baselines"] },
            { title: "7.4 Patch Management", content: [] },
            { title: "7.5 Logging & Monitoring", content: ["SIEM operations", "Log correlation", "Threat hunting"] },
            { title: "7.6 Physical & Environmental Operations", content: ["HVAC", "UPS / Generators", "Fire suppression"] },
            { title: "7.7 Recovery Strategies", content: ["Backups", "DRP", "BCP"] }
        ]
    },
    {
        id: 28,
        title: "DOMAIN 8: Software Development Security",
        icon: 'code-bracket',
        color: "bg-green-100 text-green-600",
        subTopics: [
            { title: "8.1 Software Development Models", content: ["SDLC", "Agile", "DevOps", "DevSecOps"] },
            { title: "8.2 Threat Modeling", content: ["STRIDE", "DREAD", "Attack trees"] },
            { title: "8.3 Secure Coding", content: ["OWASP Top 10", "Input validation", "Memory protection", "Secure APIs"] },
            { title: "8.4 Software Security Testing", content: ["Code review", "Static testing", "Dynamic testing"] },
            { title: "8.5 Databases & Big Data", content: ["Database encryption", "SQL injection protection", "NoSQL security"] },
            { title: "8.6 CI/CD Pipeline", content: ["Tools security", "Build environment protection", "Dependency scanning"] }
        ]
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
