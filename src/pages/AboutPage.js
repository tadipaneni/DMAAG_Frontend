// src/pages/AboutPage.js
import React from 'react';
import { 
  Mail, 
  Linkedin, 
  ExternalLink, 
  Globe,
  MapPin,
  Building,
  BookOpen,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Shreya Tadipaneni",
      role: "Software Developer Engineer",
      department: "Computer Science Department",
      bio: "Dr. Smith specializes in Antebellum Georgia history with a focus on historical documentation and preservation.",
      image: "/images/team/jane-smith.jpg",
      email: "shreyatadipaneni2@gmail.com",
      linkedin: "shreya-tadipaneni",
      website: "https://gsu.edu/faculty/jsmith"
    },
    {
      id: 2,
      name: "Dr. Michael Johnson",
      role: "Co-Principal Investigator",
      department: "English Department",
      bio: "Dr. Johnson's research focuses on narratives of enslaved individuals in the American South.",
      image: "/images/team/michael-johnson.jpg",
      email: "mjohnson@gsu.edu",
      linkedin: "michael-johnson",
      website: ""
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "Data Scientist",
      department: "Computer Science Department",
      bio: "Sarah specializes in data mining and visualization techniques for historical data sets.",
      image: "/images/team/sarah-williams.jpg",
      email: "swilliams@gsu.edu",
      linkedin: "sarah-williams",
      website: ""
    },
    {
      id: 4,
      name: "Dr. Robert Chen",
      role: "Database Administrator",
      department: "Information Systems",
      bio: "Dr. Chen specializes in database design and management for large-scale historical archives.",
      image: "/images/team/robert-chen.jpg",
      email: "rchen@gsu.edu",
      linkedin: "",
      website: ""
    },
    {
      id: 5,
      name: "Amanda Taylor",
      role: "Research Assistant",
      department: "History Department",
      bio: "Amanda is a graduate student focusing on digital humanities and archival methods.",
      image: "/images/team/amanda-taylor.jpg",
      email: "ataylor@gsu.edu",
      linkedin: "amanda-taylor",
      website: ""
    },
    {
      id: 6,
      name: "",
      role: "",
      department: "",
      bio: "",
      image: "/images/team/team-member-6.jpg",
      email: "",
      linkedin: "",
      website: ""
    },
    {
      id: 7,
      name: "",
      role: "",
      department: "",
      bio: "",
      image: "/images/team/team-member-7.jpg",
      email: "",
      linkedin: "",
      website: ""
    },
    {
      id: 8,
      name: "",
      role: "",
      department: "",
      bio: "",
      image: "/images/team/team-member-8.jpg",
      email: "",
      linkedin: "",
      website: ""
    },
    {
      id: 9,
      name: "",
      role: "",
      department: "",
      bio: "",
      image: "/images/team/team-member-9.jpg",
      email: "",
      linkedin: "",
      website: ""
    },
    {
      id: 10,
      name: "",
      role: "",
      department: "",
      bio: "",
      image: "/images/team/team-member-10.jpg",
      email: "",
      linkedin: "",
      website: ""
    }
  ];

  const collaboratingInstitutions = [
    {
      name: "Georgia State University",
      department: "Department of English",
      location: "Atlanta, GA",
      role: "Lead Institution",
      website: "https://history.gsu.edu/"
    },
    {
      name: "Troy University",
      department: "Department of History",
      location: "Troy, AL",
      role: "Partner Institution",
      website: "https://www.troy.edu/academics/colleges-schools/arts-sciences/departments/history/"
    }
  ];

  const publications = [
    {
      title: "Digital Mapping of Enslaved Individuals in Antebellum Georgia",
      authors: "Smith, J., Johnson, M., & Williams, S.",
      year: "2023",
      journal: "Digital Humanities Quarterly",
      link: "#"
    },
    {
      title: "Data Mining Historical Records: Methods and Challenges",
      authors: "Chen, R., Smith, J., & Taylor, A.",
      year: "2022",
      journal: "Journal of Historical Research",
      link: "#"
    }
  ];

  const funding = [
    {
      source: "National Endowment for the Humanities",
      grant: "Digital Humanities Advancement Grant",
      period: "2021-2024"
    },
    {
      source: "Georgia Humanities",
      grant: "Digital Archives Initiative",
      period: "2022-2023"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">
            About the DMMAG Project
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Data Mining and Mapping Antebellum Georgia - A collaborative research initiative exploring historical data of enslaved individuals in Georgia
          </p>
        </div>

        {/* Project Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              The Data Mining and Mapping Antebellum Georgia (DMMAG) project is a comprehensive digital initiative designed to preserve, analyze, and provide access to historical records about enslaved individuals in Georgia during the Antebellum period.
            </p>
            <p className="text-gray-700 mb-4">
              By combining cutting-edge database technology with modern web development tools, DMMAG creates an accessible interface for researchers, historians, genealogists, and the public to explore this important historical data.
            </p>
            <p className="text-gray-700">
              Our work focuses on digitizing and organizing records from multiple sources, including deed records, property transactions, and personal accounts, to provide a more complete picture of the lives and experiences of enslaved individuals during this period of American history.
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Meet Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                member.name ? (
                  <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={member.image} 
                        alt={`${member.name}`}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/team/profile-placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-blue-600 font-medium mb-1">{member.role}</p>
                      <p className="text-gray-500 text-sm mb-3">{member.department}</p>
                      <p className="text-gray-700 text-sm mb-4">{member.bio}</p>
                      <div className="flex items-center space-x-4">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`} 
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title={member.email}
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a 
                            href={`https://www.linkedin.com/in/${member.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {member.website && (
                          <a 
                            href={member.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="Personal Website"
                          >
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              )).filter(Boolean)}
            </div>
          </CardContent>
        </Card>

        {/* Institutions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Collaborating Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collaboratingInstitutions.map((institution, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{institution.name}</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                      <p>{institution.department}</p>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                      <p>{institution.location}</p>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                      <p>{institution.role}</p>
                    </div>
                    <div className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                      <a 
                        href={institution.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Publications */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Publications & Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publications.map((publication, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{publication.title}</h3>
                  <p className="text-gray-700 mb-1">{publication.authors}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    {publication.journal} • {publication.year}
                  </p>
                  <a 
                    href={publication.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center text-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    View Publication
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funding */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Funding & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              The DMMAG project gratefully acknowledges the financial support of the following organizations:
            </p>
            <div className="space-y-4">
              {funding.map((source, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{source.source}</h3>
                  <p className="text-gray-700 mb-1">{source.grant}</p>
                  <p className="text-gray-600 text-sm">{source.period}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Inquiries</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    <a href="mailto:contact@dmmag.org" className="hover:text-blue-600 transition-colors">
                      contact@dmmag.org
                    </a>
                  </p>
                  <p className="flex items-start text-gray-700">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600 mt-1" />
                    <span>
                      Department of English<br />
                      Georgia State University<br />
                      Atlanta, GA 30303
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Support</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    <a href="mailto:support@dmmag.org" className="hover:text-blue-600 transition-colors">
                      support@dmmag.org
                    </a>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    <a 
                      href="https://gsu.edu/english" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      gsu.edu/english
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AboutPage;