npm run build
npx serverless invoke local --function testDataIntegration --stage local --data '{ "acudiers": 10, "clients": 4, "addLocalUsers": true, "hospIds": ["10040"] }'