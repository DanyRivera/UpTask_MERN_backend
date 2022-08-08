import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
    const { nombre, email, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirma tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `

            <p>Hola ${nombre} Comprueba tu Cuenta en UpTask</p>
            <p>Tu cuenta esta ya casí lista solo debes comprobarla en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}" >Confirmar Cuenta</a>
            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}

export const emailOlvidePassword = async (datos) => {
    const { nombre, email, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Resetea tu password",
        text: "Verifica tu email para resetear tu password",
        html: `
            <p>Hola ${nombre} has solicitado restablecer tu password</p>
            <p>Sigue el siguente enlace para generar un nuevo password:</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}" >Restablecer Password</a>
            <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
        `
    })
}



