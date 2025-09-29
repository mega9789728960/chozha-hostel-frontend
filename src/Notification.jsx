import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notification() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await axios.post(
                    'https://finalbackend-mauve.vercel.app/fetchannocementforadmin',
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );

                if (response.data.success) {
                    const fetchedAnnouncements = response.data.data || response.data.announcements || [];
                    // Filter for sent announcements (not scheduled or past scheduled)
                    const sentAnnouncements = fetchedAnnouncements.filter(ann => {
                        if (!ann.scheduled_date) return true; // Immediate announcements
                        return new Date(ann.scheduled_date) <= new Date(); // Scheduled and past
                    });
                    setAnnouncements(sentAnnouncements);
                }
            } catch (err) {
                console.error('Error fetching announcements:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const marqueeText = loading
        ? 'Loading announcements...'
        : announcements.length > 0
        ? announcements.map(ann => `${ann.title}: ${ann.message}`).join(' | ')
        : '🏛️ Chozha Boys Hostel - Government College of Engineering, Thanjavur | 📋 Digital Attendance System Now Live | 💳 Online Mess Bill Payments Available | 📞 24/7 Technical Support: +91-XXXX-XXXX | 🎓 Serving 250+ Students with Excellence';

    return(
        <div className={"notification-bar bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 overflow-hidden relative border-b border-slate-600"}>
        <div className={"marquee whitespace-nowrap"}>
            <span className={"inline-block px-8 text-sm font-medium"}>
                {marqueeText}
            </span>
        </div>
    </div>
    );
}

export default Notification;
