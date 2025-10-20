// Fix: Create and export constants used throughout the application.

export const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Español' },
  { value: 'French', label: 'Français' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Japanese', label: '日本語' },
  { value: 'Chinese', label: '中文' },
  { value: 'Korean', label: '한국어' },
];

export const AUTOMATION_FRAMEWORKS = [
  'Selenium WebDriver (Java)',
  'Selenium WebDriver (Python)',
  'Selenium WebDriver (JavaScript)',
  'Cypress',
  'Playwright (JavaScript)',
  'Playwright (Python)',
  'Playwright (C#)',
  'TestCafe',
  'Appium',
  'JUnit (Java)',
  'NUnit (C#)',
  'Mocha (JavaScript)',
  'Jasmine (JavaScript)',
  'Robot Framework',
  'Protractor',
  'Cucumber (Java)',
  'Cucumber (JavaScript)',
  'Postman',
  'RestAssured',
  'Katalon Studio',
  'Appium (Java)',
  'Detox (JavaScript)',
  'Espresso (Android)',
  'XCUITest (iOS)',
];

export const CI_CD_TECHNOLOGIES = [
    'GitHub Actions',
    'CircleCI',
    'Azure DevOps',
    'GitLab CI/CD',
];

export const RUNNER_IMAGES = [
    'ubuntu-latest',
    'windows-latest',
    'macos-latest',
    'Custom Docker Image',
];

export const QUALITY_PRACTICES_BY_SECTION = [
  {
    title: 'Code Quality & Static Analysis',
    items: [
      'Use of a linter (e.g., ESLint, RuboCop)',
      'Static code analysis tools (e.g., SonarQube, CodeClimate)',
      'Code is peer-reviewed via pull requests',
      'Established coding standards and style guides are followed',
    ],
  },
  {
    title: 'Testing Strategy & Execution',
    items: [
      'Comprehensive unit tests for new code (>80% coverage)',
      'Integration tests for service interactions and APIs',
      'End-to-end (E2E) automated tests for critical user flows',
      'Code coverage metrics are tracked and reported',
      'Manual exploratory testing sessions are conducted regularly',
      'Performance and load testing for key features',
      'Security scanning (SAST/DAST) is part of the pipeline',
      'Visual regression testing for UI components',
      'Contract testing for microservices',
    ],
  },
  {
    title: 'CI/CD & DevOps',
    items: [
      'Continuous Integration (CI) server is used (e.g., Jenkins, GitHub Actions)',
      'Automated tests run on every commit/PR',
      'The build process is fully automated',
      'Deployments to production are automated (Continuous Deployment/Delivery)',
      'Canary releases or blue-green deployments are used to reduce risk',
      'Rollback procedures are automated and tested',
      'Infrastructure as Code (IaC) is used (e.g., Terraform, CloudFormation)',
    ],
  },
  {
    title: 'Monitoring & Observability',
    items: [
        'Centralized logging is in place (e.g., ELK Stack, Splunk)',
        'Application Performance Monitoring (APM) is used (e.g., DataDog, New Relic)',
        'Alerting is set up for critical system metrics and errors',
        'Distributed tracing is implemented for microservices',
    ],
  },
  {
    title: 'Process & Culture',
    items: [
      'Quality is considered a whole-team responsibility, not just QA\'s job',
      'Dedicated QA/QE engineers are embedded in development teams',
      'Regular bug triage meetings are held',
      'Blameless post-mortems are conducted for production incidents',
      'Product requirements include clear, testable acceptance criteria',
      'Feature flags are used to de-risk releases and for A/B testing',
      'A formal test plan is created for major features',
    ],
  },
];

export const ALL_QUALITY_PRACTICES: string[] = QUALITY_PRACTICES_BY_SECTION.flatMap(
  (section) => section.items
);
