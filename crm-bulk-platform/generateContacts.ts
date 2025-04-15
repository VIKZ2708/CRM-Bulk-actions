import fs from 'fs';

const stream = fs.createWriteStream('bulk-request-1million.json');
const total = 100000;

stream.write('{\n');
stream.write('"entityType": "Contact",\n');
stream.write('"actionType": "update",\n');
stream.write('"contacts": [\n');

for (let i = 0; i < total; i++) {
  const contact = {
    id: i + 1,
    updates: {
      name: `User${i}`,
      email: `user${i}@example.com`,
      phone: `987654${(1000 + i).toString().padStart(4, '0')}`,
      age: Math.floor(Math.random() * 50) + 18
    }
  };

  const isLast = i === total - 1;
  stream.write(JSON.stringify(contact) + (isLast ? '\n' : ',\n'));
}

stream.write(']\n}');
stream.end(() => {
  console.log(`✅ Created bulk-request-1million.json with ${total} contacts`);
});