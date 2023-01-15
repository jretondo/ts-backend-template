import { ETypesJoin } from '../../../enums/EFunctionsMysql';
import { INewInsert } from '../../../interfaces/IResponses';
import { IActivity } from '../../../interfaces/ITables';
import { IUser } from 'interfaces/ITables';
import { IWhereParams, IPages, IJoin } from 'interfaces/IFunctions';
import { EModeWhere, EConcatWhere, ESelectFunctions } from '../../../enums/EFunctionsMysql';
import { Tables, Columns } from '../../../enums/ETablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import moment from 'moment';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const upsert = async (user: IUser, activity_description: string) => {
        const newActivity: IActivity = {
            user_id: user.id || 0,
            activity_description: activity_description
        }
        const resp: INewInsert = await store.insert(Tables.ACTIVITY, newActivity)
        if (resp.affectedRows > 0) {
            return {
                responseInsert: resp
            }
        } else {
            throw Error("Error al insertar nueva actividad")
        }
    }

    const list = async (page: number, userId?: number, dateFrom?: string, dateTo?: string) => {
        const filters: Array<IWhereParams> | undefined = [];
        if (String(userId) !== "NaN") {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.activity.user_id, object: String(userId) }
                ]
            };
            filters.push(filter);
        }
        if (dateFrom) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.higherEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.activity.date, object: String(moment(dateFrom).format("YYYY-MM-DD 00:00:00")) }
                ]
            };
            filters.push(filter);
        }
        if (dateTo) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.lessEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.activity.date, object: String(moment(dateTo).format("YYYY-MM-DD 23:59:59")) }
                ]
            };
            filters.push(filter);
        }
        const joinUser: IJoin = {
            tableJoin: Tables.ADMIN,
            colJoin: Columns.admin.id,
            colOrigin: Columns.activity.user_id,
            type: ETypesJoin.left,
            tableOrigin: Tables.ACTIVITY
        }

        let pages: IPages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: 5,
                order: Columns.activity.date,
                asc: false
            };
            const data = await store.list(Tables.ACTIVITY, [ESelectFunctions.all], filters, undefined, pages, [joinUser]);
            const cant = await store.list(Tables.ACTIVITY, [`COUNT(${ESelectFunctions.all}) AS COUNT`], filters, undefined, undefined);
            const pagesObj = await getPages(cant[0].COUNT, 5, Number(page));

            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.ACTIVITY, [ESelectFunctions.all], filters, undefined, undefined, [joinUser]);
            return {
                data
            };
        }
    }

    return {
        upsert,
        list
    };
}