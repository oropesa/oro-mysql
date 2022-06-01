const Ofn = require( 'oro-functions' );
const { OMysql } = require( '../index' );

//

const CONFIG = Ofn.getFileJsonRecursivelySync( `${__dirname}/config.json` );

beforeAll(async () => {
    let oMysql = new OMysql( { settings: CONFIG } );
    await oMysql.poolOpen();
    await oMysql.query( "CREATE DATABASE IF NOT EXISTS test_oromysql" );
    await oMysql.query( "USE test_oromysql" );
    await oMysql.query(
        `CREATE TABLE IF NOT EXISTS test_tools ( \
                     id INT NOT NULL AUTO_INCREMENT, \
                     name VARCHAR (16) NOT NULL, \
                     info TEXT NOT NULL, \
                     enabled TINYINT(1) NOT NULL DEFAULT 0, \
                     fecha DATE NULL, \
                     created DATETIME NULL DEFAULT CURRENT_TIMESTAMP, \
                PRIMARY KEY ( id ), UNIQUE test_easy_name ( name ) ) ENGINE = InnoDB;` );
    await oMysql.poolClose();
});

afterAll(async () => {
    let oMysql = new OMysql( { settings: CONFIG } );
    await oMysql.poolOpen();
    await oMysql.query( "USE test_oromysql" );
    await oMysql.query( "DROP TABLE IF EXISTS test_tools" );
    await oMysql.poolClose();
});

//

describe('tools sanitize', () => {
    test( 'tool obj sanitize char', async () => {
        const oMysql = new OMysql();

        expect( oMysql.sanitize( `chacho`   ) ).toBe( `'chacho'`       );
        expect( oMysql.sanitize( `'chacho'` ) ).toBe( `'\\'chacho\\''` );
    } );

    test( 'tool static sanitize char', async () => {
        expect( OMysql.sanitize( `chacho`      ) ).toBe( `'chacho'`        );
        expect( OMysql.sanitize( `'chacho'`    ) ).toBe( `'\\'chacho\\''`  );
        expect( OMysql.sanitize( `"chacho"`    ) ).toBe( `'\\"chacho\\"'`  );
        expect( OMysql.sanitize( `' OR 1 = 1;` ) ).toBe( `'\\' OR 1 = 1;'` );
    } );

    test( 'tool static sanitize number', async () => {
        expect( OMysql.sanitize(  5  ) ).toBe( `5` );
        expect( OMysql.sanitize( '5' ) ).toBe( `'5'` );
    } );

    test( 'tool static sanitize null', async () => {
        expect( OMysql.sanitize( undefined ) ).toBe( `NULL` );
        expect( OMysql.sanitize( null ) ).toBe( `NULL` );
        expect( OMysql.sanitize( 'NULL' ) ).toBe( `'NULL'` );
    } );

    test( 'tool static sanitize bool', async () => {
        expect( OMysql.sanitize( true ) ).toBe( `1` );
        expect( OMysql.sanitize( false ) ).toBe( `0` );
    } );

    test( 'tool static sanitize array', async () => {
        expect( OMysql.sanitize( [ 1, 2, 3 ] ) ).toBe( `'[1,2,3]'` );
    } );

    test( 'tool static sanitize obj', async () => {
        expect( OMysql.sanitize( { chacho: 'loco', tio: 1 } ) ).toBe( `'{\\"chacho\\":\\"loco\\",\\"tio\\":1}'` );
        expect( OMysql.sanitize( { chACho: "' OR 1 = 1;" } ) ).toBe( `'{\\"chACho\\":\\"\\' OR 1 = 1;\\"}'` );
    } );
} );

describe('tools query history', () => {
    test( 'tool getAffectedRows', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `INSERT INTO test_tools ( name, info, enabled, fecha) \
                    VALUES ( 'chacho', 'loco', '1', '2022-05-01' ), \
                           ( 'foo', 'bar', '0', NULL )` );
        await oMysql.poolClose();

        expect( result.status ).toBe( true );
        expect( result.count ).toBe( 2 );
        expect( oMysql.getAffectedRows() ).toBe( 2 );
    } );

    test( 'tool getLastQuery', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getLastQuery();

        expect( lastResult.constructor.name ).toBe( 'ResultArray' );
        expect( result2 ).not.toBe( lastResult );
        expect( result2 ).toEqual( lastResult );
    } );

    test( 'tool getLastQuery offset', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getLastQuery( 1 );

        expect( lastResult.constructor.name ).toBe( 'ResultArray' );
        expect( result1 ).not.toBe( lastResult );
        expect( result1 ).toEqual( lastResult );
    } );

    test( 'tool getLastQuery raw', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getLastQuery( 0, true );

        expect( lastResult.constructor.name ).toBe( 'ResultArray' );
        expect( result2 ).toBe( lastResult );
    } );

    test( 'tool getLastQuery offset bad', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getLastQuery( 2 );

        expect( lastResult ).toBe( undefined );
    } );

    test( 'tool getFirstQuery', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getFirstQuery();

        expect( lastResult.constructor.name ).toBe( 'ResultArray' );
        expect( result1 ).not.toBe( lastResult );
        expect( result1 ).toEqual( lastResult );
    } );

    test( 'tool getFirstQuery offset', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getFirstQuery( 1 );

        expect( lastResult.constructor.name ).toBe( 'ResultArray' );
        expect( result2 ).not.toBe( lastResult );
        expect( result2 ).toEqual( lastResult );
    } );

    test( 'tool getFirstQuery raw', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getFirstQuery( 0, true );

        expect( lastResult.constructor.name ).toBe( 'ResultArray' );
        expect( result1 ).toBe( lastResult );
    } );

    test( 'tool getFirstQuery offset bad', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result1 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` );
        let result2 = await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` );
        await oMysql.poolClose();

        let lastResult = oMysql.getFirstQuery( 2 );

        expect( lastResult ).toBe( undefined );
    } );

    test( 'tool getAllQueries', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        let results = [];

        await oMysql.poolOpen();
        results.unshift( await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` ) );
        results.unshift( await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` ) );
        await oMysql.poolClose();

        let allResults = oMysql.getAllQueries();

        for( let i = 0, len = results.length; i < len; i++ ) {
            expect( results[ i ] ).not.toBe( allResults[ i ] );
            expect( results[ i ] ).toEqual( allResults[ i ] );
        }
    } );

    test( 'tool getAllQueries', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        let results = [];

        await oMysql.poolOpen();
        results.unshift( await oMysql.query( `SELECT * FROM test_tools WHERE id = 1` ) );
        results.unshift( await oMysql.query( `SELECT * FROM test_tools WHERE id = 2` ) );
        await oMysql.poolClose();

        let allResults = oMysql.getAllQueries( true );

        for( let i = 0, len = results.length; i < len; i++ ) {
            expect( results[ i ] ).toBe( allResults[ i ] );
        }

    } );
});