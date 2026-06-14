import { prisma } from "../../lib/prisma";

export class MapsRepository {

    async buscarAlertaPorId(id: string) {
        return await prisma.alerta.findUnique({
            where: { id },
            include: {
                subCategoriaAlerta: {
                    include: {
                        categoriaAlerta: true
                    }
                },
                estadoAlerta: true
            }
        });
    }
}
