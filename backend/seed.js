import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Notification from './models/Notification.js';
import LicenseKey from './models/LicenseKey.js';

const seedDatabase = async () => {
    try {
        // Connect to MongoDB Atlas
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Ticket.deleteMany({});
        await Notification.deleteMany({});
        await LicenseKey.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // =============================================
        // CREATE ADMIN USER
        // =============================================
        console.log('👑 Creating ADMIN (Super User)...');
        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'superadmin@tashkhees.com',
            password: 'superadmin123',
            role: 'ADMIN'
        });
        console.log('✅ Admin user created');
        console.log(`   📧 Email: superadmin@tashkhees.com`);
        console.log(`   🔑 Password: superadmin123`);
        console.log(`   👤 Role: ADMIN\n`);

        // =============================================
        // CREATE DEVELOPERS (Admin adds these)
        // =============================================
        console.log('🔧 Creating DEVELOPER users...');

        const dev1 = await User.create({
            name: 'Usman',
            email: 'usman@tashkhees.com',
            password: 'usman123',
            role: 'DEVELOPER'
        });
        console.log('✅ Developer 1: Usman (usman@tashkhees.com / usman123)');

        const dev2 = await User.create({
            name: 'Ahmed',
            email: 'ahmed@tashkhees.com',
            password: 'ahmed123',
            role: 'DEVELOPER'
        });
        console.log('✅ Developer 2: Ahmed (ahmed@tashkhees.com / ahmed123)');

        const dev3 = await User.create({
            name: 'Ali Hamza',
            email: 'alihamza@tashkhees.com',
            password: 'alihamza123',
            role: 'DEVELOPER'
        });
        console.log('✅ Developer 3: Ali Hamza (alihamza@tashkhees.com / alihamza123)\n');

        // =============================================
        // CREATE LICENSE KEYS (for product purchases)
        // =============================================
        console.log('🔐 Creating LICENSE KEYS...');

        const products = ['RxScan', 'Medscribe', 'Legalyze', 'DICOM Viewer', 'Breast Cancer Detection'];
        const licenseKeys = [];

        // Generate 3 used keys (for existing users)
        const usedKey1 = await LicenseKey.create({
            code: 'TSK-AMNA-1234-RXSC',
            product: 'RxScan',
            isUsed: true,
            createdBy: adminUser._id,
            notes: 'Purchased with RxScan subscription'
        });
        licenseKeys.push(usedKey1);

        const usedKey2 = await LicenseKey.create({
            code: 'TSK-SALM-5678-MEDS',
            product: 'Medscribe',
            isUsed: true,
            createdBy: adminUser._id,
            notes: 'Purchased with Medscribe subscription'
        });
        licenseKeys.push(usedKey2);

        const usedKey3 = await LicenseKey.create({
            code: 'TSK-ABKH-9012-LEGL',
            product: 'Legalyze',
            isUsed: true,
            createdBy: adminUser._id,
            notes: 'Purchased with Legalyze subscription'
        });
        licenseKeys.push(usedKey3);

        // Generate 10 available license keys
        console.log('   Generating available license keys...');
        for (let i = 0; i < 10; i++) {
            const license = await LicenseKey.create({
                code: LicenseKey.generateCode(),
                product: products[i % products.length],
                createdBy: adminUser._id,
                notes: 'Auto-generated for demo'
            });
            licenseKeys.push(license);
        }
        console.log(`✅ Created ${licenseKeys.length} license keys (3 used, 10 available)\n`);

        // =============================================
        // CREATE END USERS (with used license keys)
        // =============================================
        console.log('👤 Creating END USER accounts...');

        const user1 = await User.create({
            name: 'Amna Zafar',
            email: 'amna@example.com',
            password: 'amna123',
            role: 'USER',
            licenseKey: usedKey1.code,
            registeredProduct: usedKey1.product
        });
        // Mark key as used by this user
        usedKey1.usedBy = user1._id;
        usedKey1.usedAt = new Date();
        await usedKey1.save();
        console.log('✅ User 1: Amna Zafar (amna@example.com / amna123) - RxScan');

        const user2 = await User.create({
            name: 'Salma Iqbal',
            email: 'salma@example.com',
            password: 'salma123',
            role: 'USER',
            licenseKey: usedKey2.code,
            registeredProduct: usedKey2.product
        });
        usedKey2.usedBy = user2._id;
        usedKey2.usedAt = new Date();
        await usedKey2.save();
        console.log('✅ User 2: Salma Iqbal (salma@example.com / salma123) - Medscribe');

        const user3 = await User.create({
            name: 'Abubakar Khan',
            email: 'abubakar@example.com',
            password: 'abubakar123',
            role: 'USER',
            licenseKey: usedKey3.code,
            registeredProduct: usedKey3.product
        });
        usedKey3.usedBy = user3._id;
        usedKey3.usedAt = new Date();
        await usedKey3.save();
        console.log('✅ User 3: Abubakar Khan (abubakar@example.com / abubakar123) - Legalyze\n');

        // =============================================
        // CREATE SAMPLE TICKETS
        // =============================================
        console.log('🎫 Creating sample tickets...');

        const ticket1 = await Ticket.create({
            userName: 'Amna Zafar',
            userEmail: 'amna@example.com',
            userId: user1._id,
            product: 'RxScan',
            subject: 'Login Issue - Cannot access my account',
            description: 'I am unable to login to my RxScan account. Getting authentication error.',
            priority: 'High',
            assignedTo: dev1._id
        });
        ticket1.status = 'In Progress';
        ticket1.statusHistory.push({ status: 'In Progress', changedBy: adminUser._id });
        await ticket1.save();
        console.log(`✅ Ticket ${ticket1.ticketId}: Assigned to Usman`);

        const ticket2 = await Ticket.create({
            userName: 'Salma Iqbal',
            userEmail: 'salma@example.com',
            userId: user2._id,
            product: 'Medscribe',
            subject: 'Feature Request - Dark Mode',
            description: 'Would like dark mode in Medscribe.',
            priority: 'Medium',
            assignedTo: dev2._id
        });
        console.log(`✅ Ticket ${ticket2.ticketId}: Assigned to Ahmed`);

        const ticket3 = await Ticket.create({
            userName: 'Abubakar Khan',
            userEmail: 'abubakar@example.com',
            userId: user3._id,
            product: 'Legalyze',
            subject: 'URGENT: Document Generation Error',
            description: 'Critical error when generating documents.',
            priority: 'Critical'
        });
        console.log(`✅ Ticket ${ticket3.ticketId}: Unassigned (Critical)\n`);

        // =============================================
        // PRINT AVAILABLE LICENSE KEYS
        // =============================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 AVAILABLE LICENSE KEYS FOR NEW USER REGISTRATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const availableKeys = await LicenseKey.find({ isUsed: false });
        availableKeys.forEach((key, i) => {
            console.log(`   ${i + 1}. ${key.code} (${key.product})`);
        });
        console.log('');

        // =============================================
        // SUMMARY
        // =============================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📊 SUMMARY:');
        console.log(`   👑 Admin Users: 1`);
        console.log(`   🔧 Developers: 3`);
        console.log(`   👤 End Users: 3`);
        console.log(`   🎫 Tickets: 3`);
        console.log(`   🔐 License Keys: ${licenseKeys.length} (${availableKeys.length} available)\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 LOGIN CREDENTIALS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('👑 ADMIN:');
        console.log('   Email: superadmin@tashkhees.com');
        console.log('   Password: superadmin123\n');

        console.log('🔧 DEVELOPERS:');
        console.log('   1. Usman: usman@tashkhees.com / usman123');
        console.log('   2. Ahmed: ahmed@tashkhees.com / ahmed123');
        console.log('   3. Ali Hamza: alihamza@tashkhees.com / alihamza123\n');

        console.log('👤 END USERS:');
        console.log('   1. Amna: amna@example.com / amna123');
        console.log('   2. Salma: salma@example.com / salma123');
        console.log('   3. Abubakar: abubakar@example.com / abubakar123\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
