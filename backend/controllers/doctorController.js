import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
        res.json({ success: true, message: "Doctor availability changed successfully" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(["-password", "-email"]);
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API for doctor login
const doctorLogin = async (req, res) => {
    try{
        const { email, password } = req.body;

        const doctor = await doctorModel.findOne({ email });
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        }
        else{
            return res.json({ success: false, message: "Invalid credentials" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get doctor appointments
const doctorAppointments = async (req, res) => {
    try{
        const docId = req.docId;

        const appointments = await appointmentModel.find({docId});

        res.json({ success: true, appointments });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to complete an appointment
const appointmentComplete = async (req, res) => {
    try{
        const docId = req.docId;
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: "Appointment completed successfully" });
        }
        else{
            return res.json({ success: false, message: "Appointment not found or unauthorized access" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to cancel an appointment
const appointmentCancel = async (req, res) => {
    try{
        const docId = req.docId;
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            return res.json({ success: true, message: "Appointment cancelled successfully" });
        }
        else{
            return res.json({ success: false, message: "Cancellation failed" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard data for doctor
const doctorDashboard = async (req, res) => {
    try{
        const docId = req.docId;

        const appointments = await appointmentModel.find({ docId });

        let earnings = 0;
        appointments.map((item) => {
            if(item.isCompleted || item.payment){
                earnings += item.amount;
            }
        });

        let patients = [];
        appointments.map((item) => {
            if(!patients.includes(item.userId)){
                patients.push(item.userId);
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5),
        }

        res.json({ success: true, dashData });
    }
    catch{
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get doctor profile
const doctorProfile = async (req, res) => {
    try {
        const docId = req.docId;

        const profileData = await doctorModel.findById(docId).select("-password");
        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to update doctor profile 
const updateDoctorProfile = async (req, res) => {
    try {
        const docId = req.docId;
        const { fees, address, available } = req.body;

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    changeAvailability,
    doctorList,
    doctorLogin,
    doctorAppointments,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
};