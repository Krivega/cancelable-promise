// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const config= { 
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

   
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
 
  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: ['./src/setupTests.ts'],
 
  transform: {
    '.(ts|tsx)': 'ts-jest',
  }, 
};


export default config