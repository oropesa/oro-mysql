const mysql = require( 'mysql2/promise' );
const Ofn = require( 'oro-functions' );

class ResultArray extends Array {
    status = null;
    count = null;
    statement = null;
    columns = [];

    clone() {
        let r = new ResultArray();
        r = r.concat( Ofn.cloneArray( this ) );
        r.status = this.status;
        r.count = this.count;
        r.statement = this.statement;
        r.columns = Ofn.cloneArray( this.columns );
        this.error && ( r.error = Ofn.cloneObject( this.error ) );
        return r;
    }
}

class OMysql {

    #db
    #settings
    #serverStatus

    #queryHistory
    #lastResult

    constructor( args = {} ) {
        ! Ofn.isObject( args ) && ( args = {} );
        ! Ofn.isObject( args.settings ) && ( args.settings = {} );

        this.#settings = Object.assign( {
            host: 'localhost',
            database: null,
            user: 'root',
            password: ''
        }, Ofn.cloneObject( args.settings ) );

        this.#queryHistory = [];
        this.#serverStatus = Ofn.setResponseKO( 'Not connected yet.' );
    }

    async poolOpen( args = {} ) {
        if( this.#db ) { await this.poolClose( args ); }
        if( args.oTimer ) { args.oTimer.step( args.oTimerOpen || 'mysqlPoolOpen' ); }

        const conn = await mysql
            .createConnection( this.#settings )
            .catch( err => {
                let errArray = err.toString().split( '\r\n' );
                let response = Ofn.setResponseKO( { msg: errArray[ 0 ].replace( '\n', ' ' ), mysql: errArray } );
                args.oTimer && ( response.times = args.oTimer.getTimes() );
                return response;
            } );

        this.#db           = conn.status === false ? null : conn;
        this.#serverStatus = conn.status === false ? conn : Ofn.setResponseOK( 'Connected successfully.' );

        return this.#serverStatus;
    }

    async poolClose( args = {} ) {
        if( args.oTimer ) { args.oTimer.step( args.oTimerClose || 'mysqlPoolClose' ); }
        if( ! this.#db ) { return Ofn.setResponseOK( 'Is already disconnected.' ); }

        await this.#db.close();
        this.#db = null;
        this.#serverStatus = Ofn.setResponseKO( 'Disconnected successfully.' );
        return Ofn.setResponseOK( 'Disconnected successfully.' );
    }

    getClient() { return mysql; }

    getDB() { return this.#db; }

    getInfo() {
        let cloneSetting = Ofn.cloneObject( this.#settings );
        cloneSetting.password && (cloneSetting.password = new Array( cloneSetting.password.length ).fill( '*' ).join( '' ));
        cloneSetting.parameters && cloneSetting.parameters.password
            && (cloneSetting.parameters.password = new Array( cloneSetting.password.length ).fill( '*' ).join( '' ));

        return cloneSetting;
    }

    getStatus() { return Ofn.cloneObject( this.#serverStatus ); }

    get status() { return this.#serverStatus.status }

    getLastQuery( offset = 0, raw = false ) {
        return this.#queryHistory[ offset ] && ( raw ? this.#queryHistory[ offset ] : this.#queryHistory[ offset ].clone() );
    }

    getFirstQuery( offset = 0, raw = false ) {
        return this.#queryHistory[ this.#queryHistory.length - offset -1 ] &&
               ( raw ? this.#queryHistory[ this.#queryHistory.length - offset -1 ] : this.#queryHistory[ this.#queryHistory.length - offset -1 ].clone() );
    }

    getAllQueries( raw = false ) {
        return raw ? this.#queryHistory : this.#queryHistory.map( r => r.clone() );
    }

    getAffectedRows() { return this.#lastResult ? this.#lastResult.count : 0; }

    static sanitize( value ) { return mysql.escape( value ); }
    sanitize( value ) { return OMysql.sanitize( value ); }

    async queryOnce( query, format = 'default', valueKey = 0, valueId = 0, fnSanitize = '' ) {
        const poolOpen = await this.poolOpen();
        if( ! poolOpen.status ) { return poolOpen; }

        let result = await this.query( query, format, valueKey, valueId, fnSanitize );

        const poolClose = await this.poolClose();
        if( ! poolClose.status ) { return poolClose; }

        let lastQuery = this.getLastQuery();
        if( ! lastQuery.status ) { return Ofn.setResponseKO( lastQuery.error ) }

        return Ofn.setResponseOK( { result } );
    }

    async query( query, format = 'default', valueKey = 0, valueId = 0, fnSanitize = '' ) {
        await this.#dbQuery( query );

        if( ! this.#lastResult.status ) { return false; }

        ! valueKey && ( valueKey = 0 );
        ! valueId  && ( valueId  = 0 );

        switch( format ) {
            case 'id':
                let insertId = Ofn.issetGet( this.#lastResult.columns[ 0 ], 'insertId' );
                return fnSanitize ? fnSanitize( insertId ) : insertId;

            case 'bool':
                return fnSanitize ? fnSanitize( !! this.#lastResult.count ) : !! this.#lastResult.count;

            case 'count':
                return fnSanitize ? fnSanitize( this.#lastResult.count ) : this.#lastResult.count;

            case 'value':
                let row = this.#lastResult[ 0 ] || {};
                let value = Ofn.isNumeric( valueKey ) ? row[ Object.keys( row )[ valueKey ] ] : row[ valueKey ];
                return fnSanitize ? fnSanitize( value ) : value;

            case 'values':
                let arrValues = [];
                this.#lastResult.forEach( row => {
                    let value = Ofn.isNumeric( valueKey ) ? row[ Object.keys( row )[ valueKey ] ] : row[ valueKey ];
                    arrValues.push( fnSanitize ? fnSanitize( value ) : value );
                } );
                return arrValues;

            case 'valuesById':
                if( Ofn.isNumeric( valueId ) ) {
                    valueId = Ofn.issetGet( this.#lastResult.columns[ valueId ], 'name', 'id' );
                }
                if( ! Ofn.isString( valueId ) ) { valueId = 'id'; }

                let objValues = {};
                this.#lastResult.forEach( row => {
                    if( row[ valueId ] === undefined ) { return; }

                    let value = Ofn.isNumeric( valueKey ) ? row[ Object.keys( row )[ valueKey ] ] : row[ valueKey ];
                    objValues[ row[ valueId ] ] = fnSanitize ? fnSanitize( value ) : value
                } );
                return objValues;

            case 'array':
                let arr = [];
                if( ! fnSanitize ) {
                    arr = Ofn.cloneArray( this.#lastResult );
                }
                else {
                    this.#lastResult.forEach( row => {
                        let sanitizedRow = {};
                        const rowKeys = Object.keys( row );
                        rowKeys.forEach( ( key ) => {
                            sanitizedRow[ key ] = fnSanitize( row[ key ] )
                        } );
                        arr.push( sanitizedRow );
                    } );
                }
                return arr;

            case 'arrayById':
                if( Ofn.isNumeric( valueKey ) ) {
                    valueKey = Ofn.issetGet( this.#lastResult.columns[ valueKey ], 'name', 'id' );
                }
                if( ! Ofn.isString( valueKey ) ) { valueKey = 'id'; }

                let objArray = {};
                this.#lastResult.forEach( row => {
                    if( row[ valueKey ] === undefined ) { return; }

                    if( ! fnSanitize ) {
                        objArray[ row[ valueKey ] ] = row;
                    }
                    else {
                        let sanitizedRow = {};
                        const rowKeys = Object.keys( row );
                        rowKeys.forEach( ( key, indexKey ) => {
                            sanitizedRow[ key ] = fnSanitize( row[ key ] )
                        } );
                        objArray[ row[ valueKey ] ] = sanitizedRow;
                    }
                } );
                return objArray;

            case 'rowStrict':
                if( ! Ofn.isNumeric( valueKey ) ) { valueKey = 0; }

                let objRowStrict = {};
                let rowStrictKeys = Object.keys( this.#lastResult[ valueKey ] || {} );
                rowStrictKeys.forEach( ( key ) => {
                    let value = fnSanitize ? fnSanitize( this.#lastResult[ valueKey ][ key ] ) : this.#lastResult[ valueKey ][ key ];
                    if( ! value ) { return; }

                    objRowStrict[ key ] = value;
                } );
                return objRowStrict;

            case 'row':
                if( ! Ofn.isNumeric( valueKey ) ) { valueKey = 0; }

                let objRow = {};
                if( ! fnSanitize ) {
                    this.#lastResult[ valueKey ] && (objRow = this.#lastResult[ valueKey ] );
                }
                else {
                    let rowKeys = Object.keys( this.#lastResult[ valueKey ] || {} );
                    rowKeys.forEach( ( key ) => {
                        objRow[ key ] = fnSanitize( this.#lastResult[ valueKey ][ key ] );
                    } );
                }
                return objRow;

            case 'default':
            default:
                return this.#lastResult;
        }
    }

    #dbQuery = async ( query ) => {
        let resultArray = new ResultArray();
        resultArray.statement = query;

        if( ! this.#serverStatus.status ) {
            resultArray.status = false;
            resultArray.error = { msg: 'Server is down', serverStatus: this.getStatus() };

            this.#lastResult = resultArray;
            this.#queryHistory.unshift( this.#lastResult );

            return resultArray;
        }

        await this.#db.query( query )
            .then( result => {
                if( Ofn.type( result[ 0 ] ) === 'object' ) {
                    resultArray.columns.push( Ofn.cloneObject( result[ 0 ] ) );
                    resultArray.count = result[ 0 ].affectedRows;
                    resultArray.status = true;
                    return;
                }

                // SELECT
                const columns = [ 'characterSet', 'encoding', 'name', 'columnLength', 'columnType', 'flags', 'decimals' ];
                result[ 0 ].forEach( item => { resultArray.push( Ofn.cloneObject( item ) ); } );
                result[ 1 ] && result[ 1 ].forEach( item => { resultArray.columns.push( Ofn.cloneObjectWithKeys( item, columns ) ); } );
                resultArray.count = result[ 0 ].length;
                resultArray.status = true;
            } )
            .catch( err => {
                let errArray = err.toString().split( '\r\n' );
                resultArray.status = false;
                resultArray.error = { msg: errArray[ 0 ].replace( '\n', ' ' ), mysql: errArray };
            });

        this.#lastResult = resultArray;
        this.#queryHistory.unshift( this.#lastResult );

        return resultArray;
    }
}

module.exports = { OMysql, ResultArray };