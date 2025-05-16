'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function NewClientPage() {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6"
        >
            <Breadcrumbs
                items={[
                    { label: 'Clients', href: '/admin/clients' },
                    { label: 'Client List', href: '/admin/clients/list' },
                    { label: 'New Client' }
                ]}
            />

            <motion.div variants={item}>
                {/* New client form will go here */}
            </motion.div>
        </motion.div>
    );
} 