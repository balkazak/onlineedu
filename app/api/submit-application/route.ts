import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ref, push } from "firebase/database";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBmpXgzcoBLU6quIuTwa67F2cLYWjJ_DKY",
  authDomain: "education-platform-226f0.firebaseapp.com",
  databaseURL: "https://education-platform-226f0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "education-platform-226f0",
  storageBucket: "education-platform-226f0.firebasestorage.app",
  messagingSenderId: "54928043032",
  appId: "1:54928043032:web:741d6a418cfa88bc5f676d",
  measurementId: "G-E5Y3ECLY70"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const database = getDatabase(app);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, plan, comment } = body;

    if (!email || !phone || !plan) {
      return NextResponse.json(
        { error: "Email, телефон и тариф обязательны для заполнения" },
        { status: 400 }
      );
    }

    const applicationData = {
      email,
      phone,
      plan,
      comment: comment || "",
      timestamp: new Date().toISOString(),
      status: "new"
    };

    const applicationsRef = ref(database, "applications");
    await push(applicationsRef, applicationData);

    const emailBody = `
Новая заявка на тариф:

Email: ${email}
Телефон: ${phone}
Тариф: ${plan}
Комментарий: ${comment || "Не указан"}
Дата: ${new Date().toLocaleString("ru-RU")}
    `;

    const emailSubject = `Новая заявка на тариф: ${plan}`;

    return NextResponse.json({
      success: true,
      message: "Заявка успешно отправлена",
      emailSubject,
      emailBody
    });
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при отправке заявки" },
      { status: 500 }
    );
  }
}

